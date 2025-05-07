import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import pool from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Function to encode the image to base64
function fileToGenerativePart(filePath, mimeType) {
  const fileBuffer = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: fileBuffer.toString("base64"),
      mimeType: mimeType,
    },
  };
}

// Google Generative AI setup
let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
} catch (error) {
  console.error("Error initializing Google Generative AI:", error);
}

// Authentication middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Authentication Routes
// Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert user into database
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    const userId = result.insertId;
    
    // Generate JWT token
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Set cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: userId, name, email }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Set cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Logout user
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// User Routes
// Get current user
app.get('/api/user', verifyToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Delete user account
app.delete('/api/user', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.userId]);
    res.clearCookie('token');
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Fashion Score Routes
// Endpoint to analyze fashion (updated to allow first 3 attempts without login)
app.post('/api/analyze-fashion', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if user is authenticated
    let userId = null;
    try {
      const token = req.cookies.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      }
    } catch (error) {
      // Invalid token, but we'll still allow the request to proceed
      console.log('Not authenticated or invalid token, but proceeding as anonymous user');
    }

    const imagePath = req.file.path;
    const relativePath = path.relative(__dirname, imagePath);
    
    // Check if genAI is initialized and API key is valid
    if (!genAI || process.env.GOOGLE_API_KEY === 'your_google_api_key_here') {
      console.log('Using mock data - API key not provided or invalid');
      
      // Mock data for demo purposes
      const mockResponse = {
        score: 8,
        feedback: {
          style: "Your outfit shows a good understanding of casual style. The combination is both practical and fashionable.",
          colorCoordination: "The color palette works well together. The neutral tones create a cohesive look that's easy on the eyes.",
          fit: "The clothing fits your body type appropriately. The proportions look balanced and comfortable."
        },
        recommendations: [
          "Consider adding a statement accessory to elevate the look further.",
          "A structured jacket could add more dimension to this outfit.",
          "Experiment with different textures to add more visual interest."
        ]
      };
      
      // If user is authenticated, save the analysis to the database
      if (userId) {
        try {
          // Properly stringify the recommendations array
          const recommendationsJSON = JSON.stringify(mockResponse.recommendations);
          
          await pool.query(
            'INSERT INTO fashion_scores (user_id, image_path, score, style_feedback, color_coordination_feedback, fit_feedback, recommendations) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              userId,
              relativePath,
              mockResponse.score,
              mockResponse.feedback.style,
              mockResponse.feedback.colorCoordination,
              mockResponse.feedback.fit,
              recommendationsJSON
            ]
          );
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
          // Continue anyway to return the analysis
        }
      }
      
      return res.json(mockResponse);
    }

    // If we have a valid API key, proceed with actual AI analysis
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Analyze this outfit image and provide a fashion score out of 10. 
      Also provide feedback on the style, color coordination, fit, and recommendations 
      for improvement. 
      
      FORMAT YOUR RESPONSE AS CLEAN JSON WITHOUT ANY MARKDOWN FORMATTING, CODE BLOCKS, OR EXTRA TEXT.
      USE THIS EXACT STRUCTURE:
      {
        "score": number,
        "feedback": {
          "style": "string",
          "colorCoordination": "string",
          "fit": "string"
        },
        "recommendations": ["string", "string", "string"]
      }
      
      DO NOT include any markdown formatting like \`\`\`json or \`\`\` around your response.
    `;

    const imagePart = fileToGenerativePart(imagePath, req.file.mimetype);
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse the response as JSON
    try {
      // Clean the text to handle cases where AI returns markdown code blocks
      let cleanedText = text;
      
      // Remove markdown code block indicators if present
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.replace(/```json\n|\n```/g, '');
      } else if (cleanedText.includes('```')) {
        cleanedText = cleanedText.replace(/```\n|\n```/g, '');
      }
      
      // Trim any extra whitespace
      cleanedText = cleanedText.trim();
      
      const jsonResponse = JSON.parse(cleanedText);
      
      // If user is authenticated, save the analysis to the database
      if (userId) {
        try {
          await pool.query(
            'INSERT INTO fashion_scores (user_id, image_path, score, style_feedback, color_coordination_feedback, fit_feedback, recommendations) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              userId,
              relativePath,
              jsonResponse.score,
              jsonResponse.feedback.style,
              jsonResponse.feedback.colorCoordination,
              jsonResponse.feedback.fit,
              JSON.stringify(jsonResponse.recommendations)
            ]
          );
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
          // Continue anyway to return the analysis
        }
      }
      
      return res.json(jsonResponse);
    } catch (jsonError) {
      console.error("Error parsing AI response as JSON:", jsonError);
      return res.json({ 
        raw: text,
        error: "The AI response could not be parsed into the expected format"
      });
    }
  } catch (error) {
    console.error('Error analyzing fashion:', error);
    return res.status(500).json({ error: 'Failed to analyze fashion' });
  }
});

// Get user's fashion history
app.get('/api/fashion-history', verifyToken, async (req, res) => {
  try {
    const [scores] = await pool.query(
      `SELECT id, image_path, score, style_feedback, color_coordination_feedback, 
      fit_feedback, recommendations, created_at
      FROM fashion_scores
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [req.userId]
    );
    
    // Format the response
    const formattedScores = scores.map(score => {
      // Safely parse the JSON recommendations
      let recommendations = [];
      try {
        recommendations = JSON.parse(score.recommendations);
      } catch (error) {
        console.log('Error parsing recommendations:', error);
        // If the recommendations is a string, try to split it
        if (typeof score.recommendations === 'string') {
          recommendations = score.recommendations
            .split(',')
            .map(rec => rec.trim())
            .filter(rec => rec);
        }
      }
      
      return {
        id: score.id,
        imagePath: score.image_path,
        score: score.score,
        feedback: {
          style: score.style_feedback,
          colorCoordination: score.color_coordination_feedback,
          fit: score.fit_feedback
        },
        recommendations: recommendations,
        createdAt: score.created_at
      };
    });
    
    res.json({ history: formattedScores });
  } catch (error) {
    console.error('Error fetching fashion history:', error);
    res.status(500).json({ error: 'Failed to fetch fashion history' });
  }
});

// Healthcheck route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 
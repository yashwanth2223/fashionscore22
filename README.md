# FashionScore

FashionScore is an AI-powered web application that analyzes outfit images and provides instant feedback on your fashion choices. Using Google's Gemini Pro Vision AI model, it scores your outfit, offers insights on style, color coordination, and fit, and provides personalized recommendations to improve your look.

## Features

- **Upload & Analyze**: Take a photo or upload an image of your outfit
- **Fashion Score**: Get an objective rating of your outfit out of 10
- **Detailed Feedback**: Receive specific insights on style, color coordination, and fit
- **Personalized Recommendations**: Get actionable suggestions to improve your look
- **User Accounts**: Create an account to save your fashion analysis history
- **Profile Management**: View your profile and analysis history
- **Responsive Design**: Works on mobile, tablet, and desktop

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Framer Motion for animations
- Axios for API requests

### Backend
- Express.js server
- Google Generative AI (Gemini Pro Vision) for image analysis
- JWT for authentication
- MySQL database for storing user data and fashion scores
- Multer for file uploads

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- Google API key with access to Gemini Pro Vision

### Database Setup
1. Make sure MySQL server is running
2. Run the database setup script:
```bash
cd server
npm run setup-db
```

This will create the database and tables needed for the application.

### Backend Setup
1. Create a `.env` file in the server directory with:
```
PORT=5000
GOOGLE_API_KEY=your_google_api_key_here
JWT_SECRET=fashionscore_secret_key
```

2. Install dependencies and start server:
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Usage
1. Navigate to the application in your browser
2. Create an account or log in
3. Click "Analyze Your Outfit"
4. Upload an image of your outfit
5. View your fashion score and detailed feedback
6. Access your profile to see your analysis history

## License
MIT

## Acknowledgements
- Google Generative AI for providing the image analysis capabilities
- React and various open-source libraries for the frontend functionality 
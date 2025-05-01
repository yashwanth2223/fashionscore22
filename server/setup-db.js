import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupDatabase = async () => {
  try {
    // First connect without a database to create it if needed
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Gamma@111r'
    });
    
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS fashionscore');
    console.log('Database created or already exists');
    
    // Switch to the database
    await connection.query('USE fashionscore');
    console.log('Using fashionscore database');
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created or already exists');
    
    // Create fashion_scores table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fashion_scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        score INT NOT NULL,
        style_feedback TEXT,
        color_coordination_feedback TEXT,
        fit_feedback TEXT,
        recommendations JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Fashion scores table created or already exists');
    
    console.log('Database setup completed successfully');
    
    // Close the connection
    await connection.end();
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
};

setupDatabase(); 
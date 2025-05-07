import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupDatabase = async () => {
  try {
    // First connect without a database to create it if needed
    const connection = await mysql.createPool({
      host: 'sql12.freesqldatabase.com',
      user: 'sql12777516',
      password: process.env.DB_PASSWORD,
    });
    
    console.log('Connected to MySQL server');
    
    // sql12777516 is from freesqldatabase.com
    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS sql12777516');
    console.log('Database created or already exists');
    
    // Switch to the database
    await connection.query('USE sql12777516');
    console.log('Using sql12777516 database'); 

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
        recommendations TEXT,
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
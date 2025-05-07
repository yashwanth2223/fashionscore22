import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: 'sql12.freesqldatabase.com',
  user: 'sql12777516',
  password: process.env.DB_PASSWORD,
  database: 'sql12777516',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

// Call the test function to verify connection on server start
testConnection();

export default pool; 
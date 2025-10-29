import { Pool } from 'pg';

// The Pool will use connection details from environment variables
// that are standard for the official postgres Docker image.
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: parseInt(process.env.DB_PORT || '5432'),
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // FIX: Removed process.exit(-1) to prevent the server from crashing on a DB connection error.
  // This was causing the frontend to receive invalid responses and fail to connect.
  // The server will now log the error and continue running, allowing requests to fail gracefully.
});

export const db = {
  // Use the query method for pg
  async query(text: string, params: any[] = []) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
  }
};
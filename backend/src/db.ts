import { Pool } from 'pg';

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: parseInt(process.env.DB_PORT || '5432'),
  
  // Enable SSL for production database connections
  ssl: isProduction ? {
    rejectUnauthorized: true,
    // ca: process.env.DB_SSL_CA ? fs.readFileSync(process.env.DB_SSL_CA).toString() : undefined,
    // key: process.env.DB_SSL_KEY ? fs.readFileSync(process.env.DB_SSL_KEY).toString() : undefined,
    // cert: process.env.DB_SSL_CERT ? fs.readFileSync(process.env.DB_SSL_CERT).toString() : undefined,
  } : false,

  // Connection pooling best practices
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  // Do not exit the process, let the connection be retried or fail gracefully.
});

export const db = {
  async query(text: string, params: any[] = []) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
        console.error('Database query error', { text, error });
        throw error;
    }
  }
};

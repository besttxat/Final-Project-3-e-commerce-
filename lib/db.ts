import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = mysql.createPool({
    ...(process.env.DB_SOCKET_PATH
        ? { socketPath: process.env.DB_SOCKET_PATH }
        : { host: process.env.DB_HOST || '127.0.0.1' }),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '204218',
    database: process.env.DB_NAME || 'e-commerce',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;

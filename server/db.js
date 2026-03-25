const Pool = require('pg').Pool;

const isProduction = process.env.NODE_ENV === 'production';

const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tripv1',
        ssl: isProduction ? { rejectUnauthorized: false } : false,
    })
    : new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'tripv1',
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
    });

module.exports = pool;
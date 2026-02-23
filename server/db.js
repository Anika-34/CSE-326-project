const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'trip_com',
    password: 'password',
    port: 5432,
});

module.exports = pool;
const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const pool = require('./db');

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// routes

// users

// dummy test
app.get('/api/dummy', async (req, res) => {
    try {
        const allUsers = await pool.query('SELECT * FROM users');
        res.json(allUsers.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// create a user



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
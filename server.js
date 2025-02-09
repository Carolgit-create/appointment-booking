const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const db = new sqlite3.Database('./appointments.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT UNIQUE NOT NULL
            )
        `);
    }
});

// API to get booked dates
app.get('/api/booked-dates', (req, res) => {
    db.all('SELECT date FROM bookings', [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } else {
            const bookedDates = rows.map(row => row.date);
            res.json(bookedDates);
        }
    });
});

// API to book a date
app.post('/api/book-date', (req, res) => {
    const { date } = req.body;
    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    db.run('INSERT INTO bookings (date) VALUES (?)', [date], function(err) {
        if (err) {
            console.error(err);
            return res.status(400).json({ error: 'Date already booked' });
        }
        console.log(`Date ${date} booked successfully.`);
        res.json({ success: true });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ========================================
// Database Connection
// ========================================
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('✕ MySQL Connection Error:', err.message);
        return;
    }
    console.log('✓ Connected to MySQL database');
});

// ========================================
// API ROUTES
// ========================================

// --- Authentication ---

// Sign Up: Creates a new user in the database
app.post('/api/signup', (req, res) => {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check if email already exists
    db.query('SELECT id FROM Users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        if (results.length > 0) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }

        // Insert new user
        const query = 'INSERT INTO Users (name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [name, phone, email, password, 'user'], (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            console.log(`✓ New user registered: ${email}`);
            res.status(201).json({ message: 'Account created successfully!' });
        });
    });
});

// Login: Checks credentials against the database
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    db.query('SELECT id, name, email, phone, role, password FROM Users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = results[0];
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        console.log(`✓ User logged in: ${email} (${user.role})`);
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
});

// --- Items ---
app.get('/api/items', (req, res) => {
    const query = `
        SELECT i.*, c.name AS category_name 
        FROM Auction_Items i 
        LEFT JOIN Categories c ON i.category_id = c.id
        ORDER BY i.end_time ASC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(results);
    });
});

app.post('/api/items', (req, res) => {
    const { title, description, start_price, end_time, category_id } = req.body;
    if (!title || !start_price || !end_time || !category_id) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    const query = 'INSERT INTO Auction_Items (title, description, start_price, current_bid, end_time, category_id) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [title, description, start_price, start_price, end_time, category_id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(201).json({ message: 'Item added successfully' });
    });
});

// --- Bids ---
app.post('/api/bids', (req, res) => {
    const { item_id, bid_amount } = req.body;
    const user_id = 1; // Guest user

    db.query('SELECT current_bid, status FROM Auction_Items WHERE id = ?', [item_id], (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Item not found' });

        if (parseFloat(bid_amount) <= parseFloat(results[0].current_bid)) {
            return res.status(400).json({ message: `Bid must be higher than current bid of $${results[0].current_bid}` });
        }

        db.beginTransaction((err) => {
            if (err) return res.status(500).json({ message: err.message });

            db.query('UPDATE Auction_Items SET current_bid = ? WHERE id = ?', [bid_amount, item_id], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ message: err.message }));

                db.query('INSERT INTO Bids (item_id, user_id, bid_amount) VALUES (?, ?, ?)', [item_id, user_id, bid_amount], (err) => {
                    if (err) return db.rollback(() => res.status(500).json({ message: err.message }));

                    db.commit((err) => {
                        if (err) return db.rollback(() => res.status(500).json({ message: err.message }));
                        res.status(201).json({ message: 'Bid placed successfully' });
                    });
                });
            });
        });
    });
});

// --- Announcements ---
app.get('/api/announcements', (req, res) => {
    db.query('SELECT * FROM Announcements ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(results);
    });
});

// --- Categories ---
app.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM Categories ORDER BY name ASC', (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(results);
    });
});

// --- Feedback ---
app.post('/api/feedback', (req, res) => {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
        return res.status(400).json({ message: 'Rating and comment are required.' });
    }
    db.query('INSERT INTO Feedback (user_id, rating, comment) VALUES (?, ?, ?)', [1, rating, comment], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(201).json({ message: 'Feedback submitted' });
    });
});

// --- Users (Admin) ---
app.get('/api/users', (req, res) => {
    db.query('SELECT id, name, email, phone, role, created_at FROM Users ORDER BY id ASC', (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(results);
    });
});

app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    // Prevent deleting admin
    db.query('SELECT role FROM Users WHERE id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });
        if (results[0].role === 'admin') return res.status(403).json({ message: 'Cannot delete admin accounts.' });

        db.query('DELETE FROM Users WHERE id = ?', [userId], (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'User deleted' });
        });
    });
});

// ========================================
// Start Server
// ========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`⚜ Auction Portal running at http://localhost:${PORT}`);
});

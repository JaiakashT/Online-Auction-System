const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to DB:', err.message);
        process.exit(1);
    }
    
    console.log('\n================ USERS TABLE ================');
    db.query('SELECT id, name, phone, email, role FROM Users', (err, results) => {
        if (!err) console.table(results);

        console.log('\n================ CATEGORIES TABLE ================');
        db.query('SELECT * FROM Categories', (err, results) => {
            if (!err) console.table(results);

            console.log('\n================ AUCTION ITEMS TABLE ================');
            db.query('SELECT id, title, start_price, current_bid, end_time, status FROM Auction_Items', (err, results) => {
                if (!err) console.table(results);

                console.log('\n================ BIDS TABLE ================');
                db.query('SELECT id, item_id, user_id, bid_amount, bid_time FROM Bids', (err, results) => {
                    if (!err) console.table(results);
                    
                    console.log('\n================ ANNOUNCEMENTS TABLE ================');
                    db.query('SELECT id, title, created_at FROM Announcements', (err, results) => {
                        if (!err) console.table(results);

                        console.log('\n================ PAYMENT METHODS TABLE ================');
                        db.query('SELECT * FROM Payment_Methods', (err, results) => {
                            if (!err) console.table(results);

                            console.log('\n================ FEEDBACK TABLE ================');
                            db.query('SELECT id, user_id, rating, comment FROM Feedback', (err, results) => {
                                if (!err) console.table(results);
                                
                                db.end();
                            });
                        });
                    });
                });
            });
        });
    });
});

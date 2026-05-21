-- Auction Management System Database Schema

DROP DATABASE IF EXISTS auction_db;
CREATE DATABASE IF NOT EXISTS auction_db;
USE auction_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 3. Auction_Items Table
CREATE TABLE IF NOT EXISTS Auction_Items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_price DECIMAL(10, 2) NOT NULL,
    current_bid DECIMAL(10, 2) DEFAULT 0,
    end_time DATETIME NOT NULL,
    category_id INT,
    image_url VARCHAR(255),
    status ENUM('active', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE SET NULL
);

-- 4. Bids Table
CREATE TABLE IF NOT EXISTS Bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    user_id INT,
    bid_amount DECIMAL(10, 2) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES Auction_Items(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 5. Announcements Table
CREATE TABLE IF NOT EXISTS Announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Payment_Methods Table
CREATE TABLE IF NOT EXISTS Payment_Methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    method_type VARCHAR(50) NOT NULL,
    details VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 7. Feedback Table
CREATE TABLE IF NOT EXISTS Feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- INSERT MOCK DATA (50 ROWS COMBINED)

-- Categories (5 rows)
INSERT INTO Categories (name) VALUES ('Antiques'), ('Electronics'), ('Vehicles'), ('Art'), ('Jewelry');

-- Users (10 rows)
INSERT INTO Users (name, phone, email, password, role) VALUES 
('Admin Chief', '1234567890', 'admin@auction.com', 'password123', 'admin'),
('John Doe', '9876543210', 'john@example.com', 'password123', 'user'),
('Jane Smith', '9876543211', 'jane@example.com', 'password123', 'user'),
('Robert Brown', '9876543212', 'robert@example.com', 'password123', 'user'),
('Emily Davis', '9876543213', 'emily@example.com', 'password123', 'user'),
('Michael Wilson', '9876543214', 'michael@example.com', 'password123', 'user'),
('Sarah Garcia', '9876543215', 'sarah@example.com', 'password123', 'user'),
('David Martinez', '9876543216', 'david@example.com', 'password123', 'user'),
('Jennifer Lee', '9876543217', 'jennifer@example.com', 'password123', 'user'),
('James Taylor', '9876543218', 'james@example.com', 'password123', 'user');

-- Auction Items (10 rows)
INSERT INTO Auction_Items (title, description, start_price, current_bid, end_time, category_id) VALUES 
('Vintage Rolex', '1960s Submariner in excellent condition.', 5000.00, 5500.00, '2026-05-10 18:00:00', 5),
('Victorian Armchair', 'Mahogany frame with velvet upholstery.', 300.00, 350.00, '2026-05-12 12:00:00', 1),
('MacBook Pro M3', 'Latest model, sealed box.', 1500.00, 1600.00, '2026-05-08 20:00:00', 2),
('1967 Mustang', 'Classic muscle car, fully restored.', 25000.00, 27000.00, '2026-05-15 15:00:00', 3),
('Abstract Oil Painting', 'Modern art by local artist.', 1200.00, 1200.00, '2026-05-09 10:00:00', 4),
('Diamond Necklace', '18k white gold with 2ct diamonds.', 8000.00, 8200.00, '2026-05-11 22:00:00', 5),
('Retro Camera', 'Leica M3 from 1954.', 2000.00, 2100.00, '2026-05-07 14:00:00', 1),
('Smart TV 8K', 'Samsung 75-inch QLED.', 3000.00, 3100.00, '2026-05-08 19:00:00', 2),
('Electric Bike', 'Tesla Cyberbike concept.', 2500.00, 2600.00, '2026-05-10 16:00:00', 3),
('Gold Coin Set', 'Rare collection from the Roman Empire.', 10000.00, 10500.00, '2026-05-20 12:00:00', 5);

-- Bids (15 rows)
INSERT INTO Bids (item_id, user_id, bid_amount) VALUES 
(1, 2, 5200.00), (1, 3, 5500.00),
(2, 4, 320.00), (2, 5, 350.00),
(3, 6, 1550.00), (3, 7, 1600.00),
(4, 8, 26000.00), (4, 9, 27000.00),
(6, 2, 8100.00), (6, 3, 8200.00),
(7, 4, 2100.00),
(8, 5, 3100.00),
(9, 6, 2600.00),
(10, 7, 10500.00),
(1, 4, 5600.00);

-- Announcements (4 rows)
INSERT INTO Announcements (title, content) VALUES 
('Summer Grand Auction', 'Join us for the biggest auction of the year starting June 1st!'),
('New Categories Added', 'We now feature a dedicated section for rare books and manuscripts.'),
('Maintenance Update', 'The system will be down for maintenance on Sunday at 2 AM EST.'),
('Bid Responsibly', 'Reminder to check all item details before placing a high-value bid.');

-- Payment Methods (3 rows)
INSERT INTO Payment_Methods (user_id, method_type, details) VALUES 
(2, 'Credit Card', 'Visa ending in 4242'),
(3, 'PayPal', 'jane.smith@email.com'),
(4, 'Bank Transfer', 'Chase Bank ****1234');

-- Feedback (3 rows)
INSERT INTO Feedback (user_id, rating, comment) VALUES 
(2, 5, 'Great experience, the Rolex arrived in perfect condition!'),
(3, 4, 'Easy to use platform, highly recommended.'),
(4, 3, 'The bidding process was a bit slow, but overall good.');

# ⚜ Online Auction System (OAS)

A premium client-server web application for bidding on high-value items, featuring custom aesthetics, transaction-safe bidding, feedback management, and user role separation (User vs. Admin).

---

## 🚀 Features

*   **Premium Visual Theme**: Elegant custom HSL-based gold and mahogany layout designed with fluid CSS variables and responsive breakpoints.
*   **Live Auctions**: Browse active listings with real-time countdown displays.
*   **Real-time Bid Placement**: Interactive validation prevents low bidding, using SQL database transaction locks to preserve state consistency.
*   **System Announcements**: Notice boards managed by administrators for broadcast notifications.
*   **Feedback Portal**: Ratings and testimonials submitted directly by verified bidders.
*   **Admin Dashboard**: Manage items, monitor active metrics, and delete users safely.

---

## 🛠 Tech Stack

*   **Frontend**: Vanilla HTML5, CSS3, & Modern JavaScript (ES6+).
*   **Backend**: Node.js & Express.js.
*   **Database**: MySQL (Relational schema with cascading constraints and transactional commits).

---

## 📂 Project Structure

```text
├── db/
│   └── schema.sql       # MySQL Schema initialization & Mock Seeds
├── public/
│   ├── css/
│   │   └── style.css    # Premium Mahogany & Gold Stylesheet
│   ├── js/
│   │   ├── admin.js     # Admin control behaviors
│   │   ├── app.js       # Live updates & bidding flows
│   │   └── auth.js      # Register & Login routines
│   ├── admin.html       # Admin Panel UI
│   ├── index.html       # Bidder Dashboard UI
│   └── login.html       # Authentication Form UI
├── server/
│   └── server.js        # Express REST API
├── .env                 # Environment Config (excluded from git)
├── .gitignore           # Ignored folders and local parameters
└── package.json         # Server dependency manifests
```

---

## 🔧 Installation & Configuration

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16.0.0 or higher)
*   [MySQL Server](https://dev.mysql.com/downloads/installer/)

### 1. Database Setup
1. Open your MySQL client and run the SQL instructions located in:
   ```bash
   db/schema.sql
   ```
   This will initialize the `auction_db` schema along with mock categories, users, items, and feedback records.

### 2. Configure Environment Variables
Create a file named `.env` in the root of the project:
```env
PORT=3000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASS=your_mysql_password
DB_NAME=auction_db
JWT_SECRET=supersecretkey123
```

### 3. Install Dependencies
Navigate to the root directory and install node packages:
```bash
npm install
```

### 4. Boot Up the Server
Start the Express app locally:
```bash
node server/server.js
```
The application will run on **[http://localhost:3000](http://localhost:3000)**.

---

## 🔒 Security & Database Integrity (DBMS Highlights)
*   **Structured Triggers & Cascades**: Cascading configurations protect key dependencies (e.g. `Bids` and `Payment_Methods` are cleared safely when a `User` account is pruned).
*   **Atomic Transactions**: The API leverages `db.beginTransaction()` and transaction rollbacks to safeguard the current bid metrics during rapid concurrent actions.

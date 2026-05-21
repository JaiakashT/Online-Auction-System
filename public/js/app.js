/* ========================================
   app.js — User Dashboard Logic
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ---- Check if user is logged in ----
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    if (!userName) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('display-name').innerText = userName;

    // Show admin link if user is admin
    if (userRole === 'admin') {
        document.getElementById('admin-link').classList.remove('hidden');
    }

    // Logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'login.html';
    });

    fetchItems();
    fetchAnnouncements();

    // ---- Toast Notification System ----
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icons = { success: '✓', error: '✕', info: '⚜' };
        toast.innerHTML = `<span>${icons[type] || '⚜'}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // ---- Fetch and Display Auction Items ----
    async function fetchItems() {
        try {
            const response = await fetch('/api/items');
            const items = await response.json();
            const grid = document.getElementById('auction-grid');
            grid.innerHTML = '';

            if (items.length === 0) {
                grid.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">No auction items available right now.</p>';
                return;
            }

            items.forEach(item => {
                const endDate = new Date(item.end_time);
                const now = new Date();
                const isActive = endDate > now;
                const timeLeft = isActive ? getTimeLeft(endDate) : 'Auction Ended';

                const card = document.createElement('div');
                card.className = 'item-card';
                card.innerHTML = `
                    <div class="item-info">
                        <span class="category-badge">${item.category_name || 'General'}</span>
                        <h3 class="item-title">${item.title}</h3>
                        <p class="item-desc">${item.description || 'No description available.'}</p>
                        <div class="item-meta">
                            <span>Start Price: <span class="meta-value">$${parseFloat(item.start_price).toLocaleString()}</span></span>
                            <span>⏱ ${timeLeft}</span>
                        </div>
                        <div class="bid-info">
                            <span class="bid-label">Current Bid</span>
                            <span class="bid-amount">$${parseFloat(item.current_bid).toLocaleString()}</span>
                        </div>
                        ${isActive ? `
                        <div class="bid-input-group">
                            <input type="number" id="bid-input-${item.id}" placeholder="Min $${(parseFloat(item.current_bid) + 1).toLocaleString()}" min="${parseFloat(item.current_bid) + 1}">
                            <button class="btn btn-primary" onclick="placeBid(${item.id})">Bid Now</button>
                        </div>` : '<p style="color: var(--red); font-weight: 600; text-align: center;">Auction Closed</p>'}
                    </div>
                `;
                grid.appendChild(card);
            });
        } catch (err) {
            console.error('Error fetching items:', err);
            document.getElementById('auction-grid').innerHTML = '<p style="color: var(--red); padding: 2rem;">Failed to load auctions. Is the server running?</p>';
        }
    }

    // ---- Time Remaining Helper ----
    function getTimeLeft(endDate) {
        const diff = endDate - new Date();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        if (days > 0) return `${days}d ${hours}h left`;
        if (hours > 0) return `${hours}h left`;
        return 'Ending soon';
    }

    // ---- Place Bid ----
    window.placeBid = async (itemId) => {
        const bidInput = document.getElementById(`bid-input-${itemId}`);
        const bidAmount = parseFloat(bidInput.value);

        if (!bidAmount || isNaN(bidAmount)) {
            showToast('Please enter a valid bid amount.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/bids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_id: itemId, bid_amount: bidAmount })
            });
            const data = await response.json();
            if (response.ok) {
                showToast('Bid placed successfully!', 'success');
                fetchItems();
            } else {
                showToast(data.message || 'Failed to place bid.', 'error');
            }
        } catch (err) {
            console.error('Error placing bid:', err);
            showToast('Network error. Please try again.', 'error');
        }
    };

    // ---- Fetch and Display Announcements ----
    async function fetchAnnouncements() {
        try {
            const response = await fetch('/api/announcements');
            const announcements = await response.json();
            const list = document.getElementById('announcement-list');
            list.innerHTML = '';

            if (announcements.length === 0) {
                list.innerHTML = '<p style="color: #999; padding: 1rem;">No announcements at this time.</p>';
                return;
            }

            announcements.forEach(ann => {
                const item = document.createElement('div');
                item.className = 'announcement-item';
                item.innerHTML = `
                    <h3>${ann.title}</h3>
                    <p>${ann.content}</p>
                    <small>Posted on: ${new Date(ann.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</small>
                `;
                list.appendChild(item);
            });
        } catch (err) {
            console.error('Error fetching announcements:', err);
        }
    }

    // ---- Submit Feedback ----
    document.getElementById('feedback-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const ratingEl = document.querySelector('input[name="rating"]:checked');
        const rating = ratingEl ? ratingEl.value : 3;
        const comment = document.getElementById('comment').value;

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment })
            });
            if (response.ok) {
                showToast('Thank you for your feedback!', 'success');
                e.target.reset();
            } else {
                showToast('Failed to submit feedback.', 'error');
            }
        } catch (err) {
            console.error('Error submitting feedback:', err);
            showToast('Network error. Please try again.', 'error');
        }
    });
});

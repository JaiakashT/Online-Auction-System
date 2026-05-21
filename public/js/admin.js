/* ========================================
   admin.js — Admin Dashboard Logic
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ---- Check if user is admin ----
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');

    if (!userName) {
        window.location.href = 'login.html';
        return;
    }
    if (userRole !== 'admin') {
        alert('Access denied. Admin accounts only.');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('admin-name').innerText = userName;

    // Logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'login.html';
    });

    // Load all data
    loadStats();
    loadUsers();

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

    // ---- Load Dashboard Stats ----
    async function loadStats() {
        try {
            const [itemsRes, usersRes, categoriesRes] = await Promise.all([
                fetch('/api/items'),
                fetch('/api/users'),
                fetch('/api/categories')
            ]);

            const items = await itemsRes.json();
            const users = await usersRes.json();
            const categories = await categoriesRes.json();

            document.getElementById('stat-items').innerText = items.length;
            document.getElementById('stat-users').innerText = users.length;
            document.getElementById('stat-bids').innerText = items.filter(i => parseFloat(i.current_bid) > parseFloat(i.start_price)).length;
            document.getElementById('stat-categories').innerText = categories.length;
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    }

    // ---- Load Users Table ----
    async function loadUsers() {
        try {
            const response = await fetch('/api/users');
            const users = await response.json();
            const tbody = document.querySelector('#user-table tbody');
            tbody.innerHTML = '';

            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#999; padding:2rem;">No users found.</td></tr>';
                return;
            }

            users.forEach(user => {
                const roleClass = user.role === 'admin' ? 'role-admin' : 'role-user';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone}</td>
                    <td><span class="role-badge ${roleClass}">${user.role}</span></td>
                    <td>
                        ${user.role !== 'admin' 
                            ? `<button class="btn btn-danger" onclick="deleteUser(${user.id}, '${user.name}')">Delete</button>` 
                            : '<span style="color:#999; font-size:0.8rem;">Protected</span>'}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error('Error loading users:', err);
            document.querySelector('#user-table tbody').innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--red); padding:2rem;">Failed to load users.</td></tr>';
        }
    }

    // ---- Delete User ----
    window.deleteUser = async (userId, userName) => {
        if (!confirm(`Are you sure you want to delete "${userName}"?`)) return;

        try {
            const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            if (response.ok) {
                showToast(`User "${userName}" has been removed.`, 'success');
                loadUsers();
                loadStats();
            } else {
                showToast('Failed to delete user.', 'error');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            showToast('Network error.', 'error');
        }
    };

    // ---- Add New Item ----
    document.getElementById('add-item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('item-title').value.trim();
        const category_id = document.getElementById('item-category').value;
        const start_price = document.getElementById('item-price').value;
        const end_time = document.getElementById('item-end').value;
        const description = document.getElementById('item-desc').value.trim();

        if (!category_id) {
            showToast('Please select a category.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, category_id, start_price, end_time, description })
            });
            if (response.ok) {
                showToast('Auction item announced successfully!', 'success');
                e.target.reset();
                loadStats();
            } else {
                const data = await response.json();
                showToast(data.message || 'Failed to add item.', 'error');
            }
        } catch (err) {
            console.error('Error adding item:', err);
            showToast('Network error.', 'error');
        }
    });
});

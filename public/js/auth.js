/* ========================================
   auth.js — Login & Signup Logic
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');

    // ---- Toggle Forms ----
    showSignup.addEventListener('click', () => {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        authTitle.innerText = 'Create Account';
        authSubtitle.innerText = 'Join our premium auction community';
        clearMessages();
    });

    showLogin.addEventListener('click', () => {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        authTitle.innerText = 'Auction Portal';
        authSubtitle.innerText = 'Sign in to access premium auctions';
        clearMessages();
    });

    function clearMessages() {
        document.getElementById('login-error').innerText = '';
        document.getElementById('signup-error').innerText = '';
        document.getElementById('signup-success').innerText = '';
    }

    // ---- Handle Signup ----
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const phone = document.getElementById('signup-phone').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;

        document.getElementById('signup-error').innerText = '';
        document.getElementById('signup-success').innerText = '';
        document.getElementById('signup-btn').innerText = 'Creating...';

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, email, password })
            });
            const data = await response.json();

            if (response.ok) {
                document.getElementById('signup-success').innerText = '✓ Account created! Redirecting to login...';
                signupForm.reset();
                setTimeout(() => showLogin.click(), 1500);
            } else {
                document.getElementById('signup-error').innerText = data.message || 'Signup failed';
            }
        } catch (err) {
            document.getElementById('signup-error').innerText = 'Server not reachable. Make sure the server is running.';
        }
        document.getElementById('signup-btn').innerText = 'Create Account';
    });

    // ---- Handle Login ----
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        document.getElementById('login-error').innerText = '';
        document.getElementById('login-btn').innerText = 'Signing in...';

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                // Store user info in localStorage
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userRole', data.user.role);
                localStorage.setItem('userEmail', data.user.email);

                // Redirect based on role
                if (data.user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                document.getElementById('login-error').innerText = data.message || 'Login failed';
            }
        } catch (err) {
            document.getElementById('login-error').innerText = 'Server not reachable. Make sure the server is running.';
        }
        document.getElementById('login-btn').innerText = 'Sign In';
    });
});

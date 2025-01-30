document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    try {
        const response = await fetch('/WeatherConditions/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Login successful
            setUser(data.userId, data.username);
            window.location.href = 'index.html';
        } else {
            // Login failed
            errorMessage.textContent = data.message || 'Login failed. Please try again.';
            errorMessage.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error during login:', error);
        errorMessage.textContent = 'An error occurred. Please try again later.';
        errorMessage.classList.remove('hidden');
    }
});

// Clear error message when user starts typing
['username', 'password'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        document.getElementById('errorMessage').classList.add('hidden');
    });
});

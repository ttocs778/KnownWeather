document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    // Check if passwords match
    if (password !== confirmPassword) {
        errorMessage.textContent = 'The passwords do not match.';
        errorMessage.classList.remove('hidden');
        return;
    }

    try {
        const response = await fetch('/WeatherConditions/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Registration successful
            setUser(data.userId, data.username);
            window.location.href = 'index.html';
        } else {
            // Registration failed
            errorMessage.textContent = data.message || 'Registration failed. Please try again.';
            errorMessage.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        errorMessage.textContent = 'An error occurred. Please try again later.';
        errorMessage.classList.remove('hidden');
    }
});

// Clear error message when user starts typing
['username', 'password', 'confirmPassword'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        document.getElementById('errorMessage').classList.add('hidden');
    });
});

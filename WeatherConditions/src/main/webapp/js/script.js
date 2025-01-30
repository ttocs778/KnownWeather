// Constants
const API_KEY = '3874e236f9d0a62346304e5868c809ac';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const GEO_URL = 'http://api.openweathermap.org/geo/1.0/direct';

const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}${ampm}`;
}

// Local Storage Functions
const getUser = () => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    return userId ? { userId, username } : null;
};

const setUser = (userId, username) => {
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
};

const clearUser = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
};

// Weather API Functions
async function fetchWeatherByCity(city) {
    try {
        const geoResponse = await fetch(`${GEO_URL}?q=${city}&limit=5&appid=${API_KEY}`);
        const geoData = await geoResponse.json();
        
        if (!geoData.length) {
            return { error: 'City not found' };
        }

        const weatherPromises = geoData.map(location => 
            fetch(`${BASE_URL}?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}`)
            .then(res => res.json())
            .then(data => ({
                ...data,
                name: `${location.name}, ${location.country}`
            }))
        );

        return await Promise.all(weatherPromises);
    } catch (error) {
        console.error('Error fetching weather:', error);
        return { error: 'Failed to fetch weather data' };
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await response.json();
        return [data];
    } catch (error) {
        console.error('Error fetching weather:', error);
        return { error: 'Failed to fetch weather data' };
    }
}

// Weather Display Functions
function createWeatherDetailsHTML(data) {
    return `
        <div class="weather-details-container">
    <div class="weather-stats">
        <div class="weather-stat-row">
        	<div class="weather-detail-item">
		        <img src="images/planet-earth.png" alt="Location" class="weather-icon">
		        <span class="weather-value">${data.name}</span>
    		</div>
    		<div class="weather-detail-item">
                <img src="images/snowflake.png" alt="Low Temperature" class="weather-icon">
                <span class="weather-value">${data.main.temp_min}°</span>
            </div>
            
            <div class="weather-detail-item">
                <img src="images/sun.png" alt="High Temperature" class="weather-icon">
                <span class="weather-value">${data.main.temp_max}°</span>
            </div>
            <div class="weather-detail-item">
                <img src="images/wind.png" alt="Wind Speed" class="weather-icon">
                <span class="weather-value">${Math.round(data.wind.speed)}mi/h</span>
            </div>
        </div>
        
        <div class="weather-stat-row">
            <div class="weather-detail-item">
                <img src="images/drop.png" alt="Humidity" class="weather-icon">
                <span class="weather-value">${data.main.humidity}%</span>
            </div>
            
            <div class="weather-detail-item">
                <img src="images/LocationIcon.png" alt="Coordinates" class="weather-icon">
                <span class="weather-value">${data.coord.lat}/${data.coord.lon}</span>
            </div>
            
            <div class="weather-detail-item">
                <img src="images/thermometer.png" alt="Current Temperature" class="weather-icon">
                <span class="weather-value">${data.main.temp}°</span>
            </div>
            
            <div class="weather-detail-item">
                <img src="images/sunrise-icon.png" alt="Sunrise/Sunset" class="weather-icon">
                <span class="weather-value">${formatTime(data.sys.sunrise)}/${formatTime(data.sys.sunset)}</span>
            </div>
        </div>
    </div>
</div>
    `;
}

// Navigation Functions
function updateNavigation() {
    const user = getUser();
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const profileLink = document.getElementById('profileLink');
    const signOutLink = document.getElementById('signOutLink');

    if (user) {
        loginLink?.classList.add('hidden');
        registerLink?.classList.add('hidden');
        profileLink?.classList.remove('hidden');
        signOutLink?.classList.remove('hidden');
    } else {
        loginLink?.classList.remove('hidden');
        registerLink?.classList.remove('hidden');
        profileLink?.classList.add('hidden');
        signOutLink?.classList.add('hidden');
    }
}

// SignOut
function handleSignOut(event) {
    event.preventDefault();
    clearUser();
    window.location.href = 'index.html';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    const signOutLink = document.getElementById('signOutLink');
    if (signOutLink) {
        signOutLink.addEventListener('click', handleSignOut);
    }
});
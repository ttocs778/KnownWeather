document.addEventListener('DOMContentLoaded', async () => {
    // Check if the user is logged in
    const user = getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Update Username Display
    document.getElementById('username').textContent = user.username;

    // Load Search History
    await loadSearchHistory();
});

async function loadSearchHistory() {
    const user = getUser();
    const searchHistory = document.querySelector('.search-history');

    try {
        const response = await fetch(`/WeatherConditions/api/searches?userId=${user.userId}`);
        const searches = await response.json();

        if (searches.length === 0) {
            searchHistory.innerHTML = '<div class="search-item">No search history found.</div>';
            return;
        }

        // Sort by timestamp in descending order
        searches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Show Search History
        searchHistory.innerHTML = searches.map(search => `
            <div class="search-item" data-query="${search.searchQuery}">
                <div class="search-query">${formatSearchQuery(search.searchQuery)}</div>
            </div>
        `).join('');

        // Add click event handling
        addSearchItemClickHandlers();
    } catch (error) {
        console.error('Error loading search history:', error);
        searchHistory.innerHTML = '<div class="search-item">Error loading search history.</div>';
    }
}

function formatSearchQuery(query) {
    if (query.includes('lat=')) {
        const matches = query.match(/lat=([\d.-]+), lon=([\d.-]+)/);
        if (matches) {
            return `lat=${matches[1]}, lon=${matches[2]}`;
        }
    }
    return query;
}

function addSearchItemClickHandlers() {
    document.querySelectorAll('.search-item').forEach(item => {
        item.addEventListener('click', async () => {
            const query = item.dataset.query;
            
            try {
                let weatherData;
                if (query.includes('lat=')) {
                    const matches = query.match(/lat=([\d.-]+), lon=([\d.-]+)/);
                    if (matches) {
                        const [, lat, lon] = matches;
                        weatherData = await fetchWeatherByCoords(lat, lon);
                    }
                } else {
                    weatherData = await fetchWeatherByCity(query);
                }

                if (weatherData && !weatherData.error) {
                    // If an array is returned, the first result is used.
                    const data = Array.isArray(weatherData) ? weatherData[0] : weatherData;
                    showWeatherDetails(data);
                } else {
                    throw new Error('Failed to fetch weather data');
                }
            } catch (error) {
                console.error('Error fetching weather data:', error);
                showError('Failed to load weather details');
            }
        });
    });
}

function showError(message) {
    const weatherDetails = document.getElementById('weatherDetails');
    weatherDetails.innerHTML = `
        <div class="weather-details-container">
            <div class="error-message">${message}</div>
        </div>`;
    weatherDetails.classList.remove('hidden');
}

// Sign Out
document.getElementById('signOutLink').addEventListener('click', (e) => {
    e.preventDefault();
    clearUser();
    window.location.href = 'index.html';
});

function showWeatherDetails(weatherData) {
    const weatherDetails = document.getElementById('weatherDetails');
    weatherDetails.innerHTML = createWeatherDetailsHTML(weatherData);
    weatherDetails.classList.remove('hidden');
    weatherDetails.scrollIntoView({ behavior: 'smooth' });
}
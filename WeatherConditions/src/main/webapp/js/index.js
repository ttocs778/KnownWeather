// Map variables
let map;
let marker;

// Initialize the map
function initMap() {
    console.log('Initializing map...');
    
    // Default center
    const defaultCenter = { lat: 0, lng: 0 };
    
    // Create a map
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultCenter,
        zoom: 2,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true
    });

    map.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        if (marker) {
            marker.setPosition(event.latLng);
        } else {
            marker = new google.maps.Marker({
                position: event.latLng,
                map: map,
                draggable: true
            });
        }

        // Update the value of the input box
        document.getElementById('latitudeInput').value = lat.toFixed(6);
        document.getElementById('longitudeInput').value = lng.toFixed(6);
        
        // Turn off map overlay
        document.getElementById('mapOverlay').classList.add('hidden');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const searchTypeRadios = document.getElementsByName('searchType');
    const cityInput = document.getElementById('searchInput');
    const locationInputs = document.querySelector('.location-inputs');
    const searchButton = document.getElementById('searchButton');
    const searchIcon = document.getElementById('searchIcon');
    const mapIcon = document.getElementById('mapIcon');
    const mapOverlay = document.getElementById('mapOverlay');
    const sortOptions = document.getElementById('sortOptions');

    // Search type switch
    searchTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'city') {
                cityInput.parentElement.classList.remove('hidden');
                locationInputs.classList.add('hidden');
            } else {
                cityInput.parentElement.classList.add('hidden');
                locationInputs.classList.remove('hidden');
            }
        });
    });

    // Search button click
    searchButton.addEventListener('click', () => {
        const searchType = document.querySelector('input[name="searchType"]:checked').value;
        handleSearch(searchType);
    });

    // Search input box Enter
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch('city');
        }
    });

    // Enter the latitude and longitude input box
    ['latitudeInput', 'longitudeInput'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch('location');
            }
        });
    });

    // Map icon click
    mapIcon.addEventListener('click', (e) => {
        e.preventDefault();
        mapOverlay.classList.remove('hidden');
        if (map) {
            google.maps.event.trigger(map, 'resize');
            if (marker) {
                map.setCenter(marker.getPosition());
            }
        }
    });

    // Click on the map overlay background to close the map
    mapOverlay.addEventListener('click', (e) => {
        if (e.target === mapOverlay) {
            e.target.classList.add('hidden');
        }
    });

    // Sorting
    sortOptions?.addEventListener('change', handleSort);
});

// Search
async function handleSearch(searchType) {
    const resultsContainer = document.getElementById('searchResults');
    const weatherDetails = document.getElementById('weatherDetails');
    const resultsBody = document.getElementById('resultsBody');
    const sortOptions = document.getElementById('sortOptions');
    
    weatherDetails.classList.add('hidden');
    resultsBody.innerHTML = '';

    let weatherData;
    try {
        if (searchType === 'city') {
            const city = document.getElementById('searchInput').value.trim();
            if (!city) {
                showError('Please enter a city name');
                return;
            }
            weatherData = await fetchWeatherByCity(city);
        } else {
            const lat = document.getElementById('latitudeInput').value.trim();
            const lon = document.getElementById('longitudeInput').value.trim();
            if (!lat || !lon) {
                showError('Please enter both latitude and longitude');
                return;
            }
            weatherData = await fetchWeatherByCoords(lat, lon);
        }

        if (weatherData.error) {
            showError(weatherData.error);
            return;
        }

        // Save search history
        const user = getUser();
        if (user) {
            const searchQuery = searchType === 'city' 
                ? document.getElementById('searchInput').value
                : `lat=${document.getElementById('latitudeInput').value}, lon=${document.getElementById('longitudeInput').value}`;
            
            await saveSearch(user.userId, searchQuery);
        }

        displayResults(weatherData);
        resultsContainer.classList.remove('hidden');
        sortOptions.classList.toggle('hidden', weatherData.length <= 1);
    } catch (error) {
        console.error('Search error:', error);
        showError('An error occurred while fetching weather data');
    }
}

function displayResults(weatherData) {
    const resultsBody = document.getElementById('resultsBody');
    
    resultsBody.innerHTML = '';
    
    weatherData.forEach(data => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="city-name">${data.name}</td>
            <td>${data.main.temp_min}</td>
            <td>${data.main.temp_max}</td>
        `;
        
        row.addEventListener('click', () => showWeatherDetails(data));
        
        resultsBody.appendChild(row);
    });

    document.getElementById('searchResults').classList.remove('hidden');
}

// handleSort
function handleSort(e) {
    const rows = Array.from(document.querySelectorAll('#resultsBody tr'));
    const weatherData = rows.map(row => ({
        name: row.cells[0].textContent,
        tempLow: parseFloat(row.cells[1].textContent),
        tempHigh: parseFloat(row.cells[2].textContent)
    }));

    switch (e.target.value) {
        case 'tempLowDesc':
            weatherData.sort((a, b) => b.tempLow - a.tempLow);
            break;
        case 'tempLowAsc':
            weatherData.sort((a, b) => a.tempLow - b.tempLow);
            break;
        case 'tempHighDesc':
            weatherData.sort((a, b) => b.tempHigh - a.tempHigh);
            break;
        case 'tempHighAsc':
            weatherData.sort((a, b) => a.tempHigh - b.tempHigh);
            break;
        case 'name':
            weatherData.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    resultsBody.innerHTML = weatherData.map(data => `
        <tr>
            <td class="city-name">${data.name}</td>
            <td>${data.tempLow}</td>
            <td>${data.tempHigh}</td>
        </tr>
    `).join('');
}

async function saveSearch(userId, searchQuery) {
    try {
        const response = await fetch('/WeatherConditions/api/searches', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                searchQuery: searchQuery
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save search');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to save search');
        }

        return data;
    } catch (error) {
        console.error('Error saving search:', error);
    }
}

function showWeatherDetails(weatherData) {
    const weatherDetails = document.getElementById('weatherDetails');
    const searchResults = document.getElementById('searchResults');
    
    weatherDetails.innerHTML = createWeatherDetailsHTML(weatherData);
    weatherDetails.classList.remove('hidden');
    searchResults.classList.add('hidden');
    weatherDetails.scrollIntoView({ behavior: 'smooth' });
}

function showError(message) {
    console.error(message);
    alert(message);
}
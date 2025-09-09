// Global variables
let map;
let weatherMarkers = [];
let currentLocation = null;
let weatherData = {};

// API Configuration
const WEATHER_API_KEY = 'demo'; // Replace with your OpenWeatherMap API key
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';
const GEOCODING_API_BASE = 'https://api.openweathermap.org/geo/1.0';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    setupEventListeners();
    loadPopularCities();
});

// Initialize the map
function initializeMap() {
    // Create map centered on world view
    map = L.map('map').setView([20, 0], 2);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add click event to map
    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        getWeatherByCoordinates(lat, lng);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('locationSearch');
    const searchBtn = document.getElementById('searchBtn');
    
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Panel controls
    document.getElementById('closePanel').addEventListener('click', closeWeatherPanel);
    document.getElementById('closeError').addEventListener('click', hideError);
    
    // Toggle view button
    document.getElementById('toggleView').addEventListener('click', toggleView);
}

// Handle search functionality
async function handleSearch() {
    const searchInput = document.getElementById('locationSearch');
    const query = searchInput.value.trim();
    
    if (!query) return;
    
    showLoading();
    
    try {
        const coordinates = await geocodeLocation(query);
        if (coordinates) {
            getWeatherByCoordinates(coordinates.lat, coordinates.lon);
            map.setView([coordinates.lat, coordinates.lon], 10);
        } else {
            showError('Location not found. Please try a different search term.');
        }
    } catch (error) {
        console.error('Search error:', error);
        showError('Error searching for location. Please try again.');
    } finally {
        hideLoading();
    }
}

// Geocode location using OpenWeatherMap Geocoding API
async function geocodeLocation(query) {
    try {
        const response = await fetch(
            `${GEOCODING_API_BASE}/direct?q=${encodeURIComponent(query)}&limit=1&appid=${WEATHER_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Geocoding API error');
        }
        
        const data = await response.json();
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// Get weather data by coordinates
async function getWeatherByCoordinates(lat, lng) {
    showLoading();
    
    try {
        // Get current weather
        const currentWeather = await fetchCurrentWeather(lat, lng);
        
        // Get 10-day forecast
        const forecast = await fetchForecast(lat, lng);
        
        if (currentWeather && forecast) {
            currentLocation = {
                lat: lat,
                lng: lng,
                name: currentWeather.name,
                country: currentWeather.sys.country
            };
            
            weatherData = {
                current: currentWeather,
                forecast: forecast
            };
            
            updateWeatherDisplay();
            addWeatherMarker(lat, lng, currentWeather);
            showWeatherPanel();
        } else {
            showError('Unable to fetch weather data for this location.');
        }
    } catch (error) {
        console.error('Weather fetch error:', error);
        showError('Error fetching weather data. Please try again.');
    } finally {
        hideLoading();
    }
}

// Fetch current weather data
async function fetchCurrentWeather(lat, lng) {
    try {
        const response = await fetch(
            `${WEATHER_API_BASE}/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error('Weather API error');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Current weather fetch error:', error);
        return null;
    }
}

// Fetch 10-day forecast
async function fetchForecast(lat, lng) {
    try {
        const response = await fetch(
            `${WEATHER_API_BASE}/forecast?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error('Forecast API error');
        }
        
        const data = await response.json();
        return processForecastData(data);
    } catch (error) {
        console.error('Forecast fetch error:', error);
        return null;
    }
}

// Process forecast data to get daily forecasts
function processForecastData(data) {
    const dailyForecasts = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        if (!dailyForecasts[dateKey]) {
            dailyForecasts[dateKey] = {
                date: date,
                temps: [],
                descriptions: [],
                icons: []
            };
        }
        
        dailyForecasts[dateKey].temps.push(item.main.temp);
        dailyForecasts[dateKey].descriptions.push(item.weather[0].description);
        dailyForecasts[dateKey].icons.push(item.weather[0].icon);
    });
    
    // Convert to array and calculate daily averages
    return Object.values(dailyForecasts).map(day => {
        const avgTemp = day.temps.reduce((a, b) => a + b, 0) / day.temps.length;
        const maxTemp = Math.max(...day.temps);
        const minTemp = Math.min(...day.temps);
        
        // Get most common description and icon
        const mostCommonDesc = getMostCommon(day.descriptions);
        const mostCommonIcon = getMostCommon(day.icons);
        
        return {
            date: day.date,
            avgTemp: Math.round(avgTemp),
            maxTemp: Math.round(maxTemp),
            minTemp: Math.round(minTemp),
            description: mostCommonDesc,
            icon: mostCommonIcon
        };
    }).slice(0, 10); // Limit to 10 days
}

// Helper function to get most common item in array
function getMostCommon(arr) {
    const counts = {};
    arr.forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

// Add weather marker to map
function addWeatherMarker(lat, lng, weatherData) {
    // Remove existing marker for this location
    removeWeatherMarker(lat, lng);
    
    const temp = Math.round(weatherData.main.temp);
    const icon = getWeatherIcon(weatherData.weather[0].icon);
    
    const marker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: 'weather-marker',
            html: `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                     <i class="${icon}" style="font-size: 16px; margin-right: 2px;"></i>
                     <span style="font-size: 12px; font-weight: bold;">${temp}°</span>
                   </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        })
    }).addTo(map);
    
    marker.bindPopup(`
        <div style="text-align: center; min-width: 150px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">${weatherData.name}</h4>
            <div style="font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 5px;">
                ${temp}°C
            </div>
            <div style="color: #666; text-transform: capitalize; margin-bottom: 10px;">
                ${weatherData.weather[0].description}
            </div>
            <div style="font-size: 12px; color: #999;">
                Feels like ${Math.round(weatherData.main.feels_like)}°C
            </div>
        </div>
    `);
    
    weatherMarkers.push(marker);
}

// Remove weather marker
function removeWeatherMarker(lat, lng) {
    weatherMarkers = weatherMarkers.filter(marker => {
        const markerLat = marker.getLatLng().lat;
        const markerLng = marker.getLatLng().lng;
        
        if (Math.abs(markerLat - lat) < 0.01 && Math.abs(markerLng - lng) < 0.01) {
            map.removeLayer(marker);
            return false;
        }
        return true;
    });
}

// Update weather display
function updateWeatherDisplay() {
    if (!weatherData.current || !currentLocation) return;
    
    const current = weatherData.current;
    
    // Update location name
    document.getElementById('selectedLocation').textContent = 
        `${current.name}, ${current.sys.country}`;
    
    // Update current weather
    document.getElementById('currentTemp').textContent = Math.round(current.main.temp);
    document.getElementById('weatherDescription').textContent = current.weather[0].description;
    document.getElementById('weatherIcon').className = getWeatherIcon(current.weather[0].icon);
    
    // Update weather details
    document.getElementById('visibility').textContent = `${(current.visibility / 1000).toFixed(1)} km`;
    document.getElementById('humidity').textContent = `${current.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${current.wind.speed} m/s`;
    document.getElementById('feelsLike').textContent = `${Math.round(current.main.feels_like)}°C`;
    
    // Update forecast
    updateForecastDisplay();
    
    // Show panels
    document.getElementById('currentWeather').style.display = 'block';
    document.getElementById('forecastContainer').style.display = 'block';
}

// Update forecast display
function updateForecastDisplay() {
    const forecastList = document.getElementById('forecastList');
    forecastList.innerHTML = '';
    
    weatherData.forecast.forEach(day => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        const dateStr = day.date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        forecastItem.innerHTML = `
            <div class="forecast-date">${dateStr}</div>
            <div class="forecast-icon">
                <i class="${getWeatherIcon(day.icon)}"></i>
            </div>
            <div class="forecast-desc">${day.description}</div>
            <div class="forecast-temps">
                <div class="forecast-high">${day.maxTemp}°</div>
                <div class="forecast-low">${day.minTemp}°</div>
            </div>
        `;
        
        forecastList.appendChild(forecastItem);
    });
}

// Get weather icon class
function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain',
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };
    
    return iconMap[iconCode] || 'fas fa-cloud';
}

// Show weather panel
function showWeatherPanel() {
    document.getElementById('weatherPanel').style.display = 'block';
}

// Close weather panel
function closeWeatherPanel() {
    document.getElementById('weatherPanel').style.display = 'none';
}

// Toggle view (placeholder for future list view)
function toggleView() {
    const toggleBtn = document.getElementById('toggleView');
    const icon = toggleBtn.querySelector('i');
    
    if (icon.classList.contains('fa-list')) {
        icon.className = 'fas fa-map';
        toggleBtn.innerHTML = '<i class="fas fa-map"></i> Map View';
        // Future: Implement list view
    } else {
        icon.className = 'fas fa-list';
        toggleBtn.innerHTML = '<i class="fas fa-list"></i> List View';
        // Future: Implement map view
    }
}

// Load popular cities on startup
async function loadPopularCities() {
    const popularCities = [
        { name: 'London', country: 'GB', lat: 51.5074, lng: -0.1278 },
        { name: 'New York', country: 'US', lat: 40.7128, lng: -74.0060 },
        { name: 'Tokyo', country: 'JP', lat: 35.6762, lng: 139.6503 },
        { name: 'Paris', country: 'FR', lat: 48.8566, lng: 2.3522 },
        { name: 'Sydney', country: 'AU', lat: -33.8688, lng: 151.2093 },
        { name: 'Dubai', country: 'AE', lat: 25.2048, lng: 55.2708 },
        { name: 'Mumbai', country: 'IN', lat: 19.0760, lng: 72.8777 },
        { name: 'São Paulo', country: 'BR', lat: -23.5505, lng: -46.6333 }
    ];
    
    // Load weather for a few popular cities
    for (let i = 0; i < 4; i++) {
        const city = popularCities[i];
        try {
            const weather = await fetchCurrentWeather(city.lat, city.lng);
            if (weather) {
                addWeatherMarker(city.lat, city.lng, weather);
            }
        } catch (error) {
            console.error(`Error loading weather for ${city.name}:`, error);
        }
    }
}

// Show loading overlay
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Show error message
function showError(message) {
    document.getElementById('errorText').textContent = message;
    document.getElementById('errorMessage').style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(hideError, 5000);
}

// Hide error message
function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

// Demo mode - simulate weather data when API key is not available
function isDemoMode() {
    return WEATHER_API_KEY === 'demo';
}

// Demo weather data
const demoWeatherData = {
    current: {
        name: 'Demo City',
        sys: { country: 'XX' },
        main: {
            temp: 22,
            feels_like: 24,
            humidity: 65,
            visibility: 10000
        },
        weather: [{ description: 'partly cloudy', icon: '02d' }],
        wind: { speed: 3.5 }
    },
    forecast: Array.from({ length: 10 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        maxTemp: 20 + Math.floor(Math.random() * 10),
        minTemp: 15 + Math.floor(Math.random() * 5),
        description: ['sunny', 'cloudy', 'rainy', 'partly cloudy'][Math.floor(Math.random() * 4)],
        icon: ['01d', '02d', '03d', '10d'][Math.floor(Math.random() * 4)]
    }))
};

// Override API functions for demo mode
if (isDemoMode()) {
    console.log('Running in demo mode. Please add your OpenWeatherMap API key to script.js');
    
    // Override fetch functions for demo
    window.fetchCurrentWeather = async function(lat, lng) {
        return new Promise(resolve => {
            setTimeout(() => resolve(demoWeatherData.current), 1000);
        });
    };
    
    window.fetchForecast = async function(lat, lng) {
        return new Promise(resolve => {
            setTimeout(() => resolve(demoWeatherData.forecast), 1000);
        });
    };
    
    window.geocodeLocation = async function(query) {
        return new Promise(resolve => {
            setTimeout(() => resolve({
                lat: 40.7128 + (Math.random() - 0.5) * 10,
                lon: -74.0060 + (Math.random() - 0.5) * 10,
                name: query,
                country: 'XX'
            }), 500);
        });
    };
}
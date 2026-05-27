const API_KEY = 'demo'; // Using demo mode, replace with real API key
const API_URL = 'https://api.openweathermap.org/data/2.5';

// Initialize with a default city
window.addEventListener('load', () => {
    getWeatherByCity('London');
});

function getWeatherByCity(city) {
    // Using weather.gov API (no API key needed)
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`)
        .then(res => res.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const location = data.results[0];
                getWeatherByCoords(location.latitude, location.longitude, city);
            } else {
                alert('City not found');
            }
        })
        .catch(err => alert('Error: ' + err.message));
}

function getWeatherByCoords(lat, lon, city) {
    // Using Open-Meteo API (free, no key needed)
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`)
        .then(res => res.json())
        .then(data => {
            displayWeather(data, city);
            displayForecast(data);
        })
        .catch(err => alert('Error fetching weather: ' + err.message));
}

function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                // Get city name from coordinates
                fetch(`https://geocoding-api.open-meteo.com/v1/search?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`)
                    .then(res => res.json())
                    .then(data => {
                        const city = data.results?.[0]?.name || 'Your Location';
                        getWeatherByCoords(latitude, longitude, city);
                    });
            },
            error => alert('Error getting location: ' + error.message)
        );
    } else {
        alert('Geolocation not supported');
    }
}

function searchWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        getWeatherByCity(city);
        document.getElementById('cityInput').value = '';
    }
}

function getWeatherEmoji(code) {
    if (code === 0 || code === 1) return '☀️';
    if (code === 2) return '⛅';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '🌨️';
    if (code >= 80 && code <= 82) return '⛈️';
    if (code === 85 || code === 86) return '🌨️';
    if (code >= 90 && code <= 99) return '⛈️';
    return '🌤️';
}

function getWeatherCondition(code) {
    if (code === 0) return 'Clear';
    if (code === 1 || code === 2) return 'Mostly Clear';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Drizzle';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code === 85 || code === 86) return 'Snow Showers';
    if (code >= 90 && code <= 99) return 'Thunderstorm';
    return 'Unknown';
}

function displayWeather(data, city) {
    const current = data.current;
    const temp = Math.round(current.temperature_2m);
    const condition = getWeatherCondition(current.weather_code);
    const emoji = getWeatherEmoji(current.weather_code);
    const humidity = current.relative_humidity_2m;
    const windSpeed = Math.round(current.wind_speed_10m);

    const currentWeather = document.getElementById('currentWeather');
    currentWeather.innerHTML = `
        <h2>${emoji} ${city}</h2>
        <div style="font-size: 48px; color: #667eea; margin: 20px 0;">${temp}°C</div>
        <div style="font-size: 20px; color: #666; margin-bottom: 20px;">${condition}</div>
        <div class="weather-grid">
            <div class="weather-item">
                <div class="weather-item-label">Humidity</div>
                <div class="weather-item-value">${humidity}%</div>
            </div>
            <div class="weather-item">
                <div class="weather-item-label">Wind Speed</div>
                <div class="weather-item-value">${windSpeed} km/h</div>
            </div>
            <div class="weather-item">
                <div class="weather-item-label">Condition</div>
                <div class="weather-item-value">${emoji}</div>
            </div>
        </div>
    `;
}

function displayForecast(data) {
    const daily = data.daily;
    const forecast = document.getElementById('forecast');
    forecast.innerHTML = '';

    for (let i = 1; i < 6 && i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const code = daily.weather_code[i];
        const condition = getWeatherCondition(code);
        const emoji = getWeatherEmoji(code);

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div style="font-size: 30px; margin: 10px 0;">${emoji}</div>
            <div class="forecast-condition">${condition}</div>
            <div class="forecast-temp">${maxTemp}° / ${minTemp}°</div>
        `;
        forecast.appendChild(card);
    }
}
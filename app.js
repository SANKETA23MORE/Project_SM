// app.js

const apiKey = '1a303cc56edee02f25d3caaeab80a488';
const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

// Event listeners
document.getElementById('search-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value.trim();
    if (city) {
        fetchWeatherData(city);
        addCityToRecentSearches(city);
    } else {
        alert('Please enter a valid city name.');
    }
});

document.getElementById('current-location-btn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherDataByCoordinates(latitude, longitude);
        }, () => {
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// Fetch weather data by city name
function fetchWeatherData(city) {
    const url = `${weatherApiUrl}?q=${city}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => updateWeatherUI(data))
        .catch(error => handleError(error));
}

// Fetch weather data by coordinates
function fetchWeatherDataByCoordinates(lat, lon) {
    const url = `${weatherApiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => updateWeatherUI(data))
        .catch(error => handleError(error));
}

// Update UI with weather data
function updateWeatherUI(data) {
    if (data.cod !== 200) {
        handleError({ message: data.message });
        return;
    }

    const weatherDataDiv = document.getElementById('weather-data');
    const { name, main, weather } = data;

    weatherDataDiv.innerHTML = `
        <h2 class="text-2xl font-bold mb-2">${name}</h2>
        <img src="http://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}" class="weather-icon">
        <p class="text-xl">${main.temp} °C</p>
        <p>${weather[0].description}</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
    weatherDataDiv.style.display = 'block';

    fetchExtendedForecast(data.name);
}

// Fetch and display extended forecast
function fetchExtendedForecast(city) {
    const url = `${forecastApiUrl}?q=${city}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => updateExtendedForecastUI(data))
        .catch(error => handleError(error));
}

// Update UI with extended forecast data
function updateExtendedForecastUI(data) {
    const forecastData = data.list.filter((_, index) => index % 8 === 0);
    const weatherDataDiv = document.getElementById('weather-data');

    const forecastHtml = forecastData.map(day => `
        <div class="forecast-day">
            <h4>${new Date(day.dt_txt).toLocaleDateString()}</h4>
            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}" class="weather-icon">
            <p>${day.main.temp} °C</p>
            <p>${day.weather[0].description}</p>
            <p>Wind: ${day.wind.speed} m/s</p>
            <p>Humidity: ${day.main.humidity}%</p>
        </div>
    `).join('');

    weatherDataDiv.innerHTML += `
        <h3 class="text-xl font-bold mt-4">5-Day Forecast</h3>
        <div class="flex justify-center">${forecastHtml}</div>
    `;
}

// Handle errors and display error messages
function handleError(error) {
    const weatherDataDiv = document.getElementById('weather-data');
    weatherDataDiv.innerHTML = `<p class="text-red-500">${error.message}</p>`;
    weatherDataDiv.style.display = 'block';
}

// Add city to recent searches and update the dropdown
function addCityToRecentSearches(city) {
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    if (!recentSearches.includes(city)) {
        recentSearches.push(city);
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
    updateRecentSearchesDropdown();
}

// Update recent searches dropdown
function updateRecentSearchesDropdown() {
    const recentSearchesDiv = document.getElementById('recent-searches');
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

    if (recentSearches.length > 0) {
        recentSearchesDiv.style.display = 'block';
        recentSearchesDiv.innerHTML = `
            <h3 class="text-lg font-bold mb-2">Recent Searches:</h3>
            <select id="recent-cities" class="p-2 border rounded">
                <option value="" disabled selected>Select a city</option>
                ${recentSearches.map(city => `<option value="${city}">${city}</option>`).join('')}
            </select>
        `;

        document.getElementById('recent-cities').addEventListener('change', (e) => {
            const selectedCity = e.target.value;
            fetchWeatherData(selectedCity);
        });
    } else {
        recentSearchesDiv.style.display = 'none';
    }
}

// Initialize the recent searches dropdown on page load
updateRecentSearchesDropdown();

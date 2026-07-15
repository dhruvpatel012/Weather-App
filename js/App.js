// app.js
// This is the main file. It connects the buttons on the page to the API calls and the UI updates.

const DEFAULT_CITY = "London";
let clockTimer = null;

// Runs once the page has fully loaded
function init() {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  setupTheme();
  setupEventListeners();

  // The API key is already set in api.js, so we can load weather right away
  const lastCity = loadFromStorage("skycast_last_city", DEFAULT_CITY);
  loadWeather(lastCity);
}

// Load the saved theme (dark or light) when the page opens
function setupTheme() {
  const savedTheme = loadFromStorage("skycast_theme", "dark");
  applyTheme(savedTheme);
}

// Switch the theme and remember the choice
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  saveToStorage("skycast_theme", next);
}

// Start updating the clock every 30 seconds
function startClock() {
  if (clockTimer) {
    clearInterval(clockTimer);
  }
  updateDateTime();
  clockTimer = setInterval(updateDateTime, 30000);
}

// Ask the API for weather data for a city name, then show it
async function loadWeather(city) {
  showLoading();

  try {
    const data = await getForecast(city, 7);
    showWeatherData(data);
    saveToStorage("skycast_last_city", city);
  } catch (error) {
    handleWeatherError(error);
  }
}

// Ask the API for weather data using GPS coordinates, then show it
async function loadWeatherByCoords(lat, lon) {
  showLoading();

  try {
    const data = await getForecastByCoords(lat, lon, 7);
    showWeatherData(data);
    saveToStorage("skycast_last_city", data.location.name);
  } catch (error) {
    handleWeatherError(error);
  }
}

// Take the data we got back from the API and put it on the page
function showWeatherData(data) {
  const location = data.location;
  const current = data.current;
  const today = data.forecast.forecastday[0];

  renderHero(location, current);
  renderHighLow(today.day);

  // combine today's remaining hours with tomorrow's hours
  // so the hourly strip always has enough cards to fill 24 hours
  const tomorrow = data.forecast.forecastday[1];
  const allHours = tomorrow ? today.hour.concat(tomorrow.hour) : today.hour;
  renderHourly(allHours);

  renderDaily(data.forecast.forecastday);
  renderStats(current, today.astro);

  const isDay = current.is_day === 1;
  const mood = getWeatherMood(current.condition.text, isDay);
  applyGlowMood(mood);

  showContent();
  startClock();
}

// Figure out what error message to show the user
function handleWeatherError(error) {
  showContent();

  if (error.message === "no-api-key") {
    showError("No API key set. (Local: configure js/config.js; Vercel: set WEATHER_API_KEY in environment variables).");
    return;
  }
  if (error.message === "bad-api-key") {
    showError("That API key was rejected. Double check your key in js/config.js or Vercel environment variables.");
    return;
  }
  if (error.message === "city-not-found") {
    showError("We couldn't find that city. Try a different search.");
    return;
  }
  if (error.message === "network-error") {
    showError("Unable to reach the weather service. Check your connection.");
    return;
  }
  showError("Something unexpected happened. Please try again.");
  console.log(error);
}

// Use the browser's location feature to find weather near the user
function useCurrentLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }

  showLoading();

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      loadWeatherByCoords(lat, lon);
    },
    function () {
      showError("Location access was denied. Try searching for a city instead.");
      showContent();
    },
    { timeout: 8000 }
  );
}

// Hook up all the buttons and forms on the page
function setupEventListeners() {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const locationBtn = document.getElementById("locationBtn");
  const themeToggle = document.getElementById("themeToggle");
  const errorClose = document.getElementById("errorClose");

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const city = searchInput.value.trim();
    if (city !== "") {
      loadWeather(city);
      searchInput.blur();
    }
  });

  locationBtn.addEventListener("click", useCurrentLocation);
  themeToggle.addEventListener("click", toggleTheme);
  errorClose.addEventListener("click", hideError);
}

// Wait for the page to load, then start the app
document.addEventListener("DOMContentLoaded", init);
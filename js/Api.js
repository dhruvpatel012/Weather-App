// api.js
// This file talks to the WeatherAPI.com website and gets weather data back.

const BASE_URL = "https://api.weatherapi.com/v1";

// Get the API key from config.js (CONFIG object)
function getApiKey() {
  if (typeof CONFIG !== "undefined" && CONFIG.API_KEY) {
    return CONFIG.API_KEY;
  }
  return "";
}

// Get the weather forecast for a city name (like "Paris")
// days = how many days of forecast we want (we use 7)
async function getForecast(city, days) {
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:";
  const hasLocalKey = typeof CONFIG !== "undefined" && CONFIG.API_KEY;

  let url;
  if (isLocal && hasLocalKey) {
    // Local development mode: fetch directly using local key
    const apiKey = CONFIG.API_KEY;
    url =
      BASE_URL +
      "/forecast.json?key=" +
      apiKey +
      "&q=" +
      encodeURIComponent(city) +
      "&days=" +
      days +
      "&aqi=no&alerts=no";
  } else {
    // Production/Vercel mode: fetch via serverless function proxy
    url = `/api/weather?city=${encodeURIComponent(city)}&days=${days}`;
  }

  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    // fetch() only fails like this when there is no internet connection
    throw new Error("network-error");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMsg = errorData && errorData.error ? errorData.error : "";

    // If the proxy backend returned a clean error code string, throw it directly
    if (errorMsg && typeof errorMsg === "string") {
      throw new Error(errorMsg);
    }

    // Fallback error parsing if calling direct API or unexpected proxy structure
    const errorMessage = errorData && errorData.error ? errorData.error.message : "";
    if (response.status === 400 && errorMessage.toLowerCase().includes("no matching location")) {
      throw new Error("city-not-found");
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("bad-api-key");
    }
    throw new Error("unknown-error");
  }

  const data = await response.json();
  return data;
}

// Same as getForecast, but using latitude/longitude instead of a city name
// (used for the "current location" button)
async function getForecastByCoords(lat, lon, days) {
  const coords = lat + "," + lon;
  return getForecast(coords, days);
}
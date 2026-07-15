// api.js
// This file talks to the WeatherAPI.com website and gets weather data back.

const BASE_URL = "https://api.weatherapi.com/v1";

// WEATHERAPI.COM KEY 
const API_KEY = "d41f353085a54ae6ac262939261407";

// Get the API key we hardcoded above
function getApiKey() {
  return API_KEY;
}

// Get the weather forecast for a city name (like "Paris")
// days = how many days of forecast we want (we use 7)
async function getForecast(city, days) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("no-api-key");
  }

  const url =
    BASE_URL +
    "/forecast.json?key=" +
    apiKey +
    "&q=" +
    encodeURIComponent(city) +
    "&days=" +
    days +
    "&aqi=no&alerts=no";

  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    // fetch() only fails like this when there is no internet connection
    throw new Error("network-error");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
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
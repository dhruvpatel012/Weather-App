// api/weather.js
// Vercel Serverless Function to proxy WeatherAPI calls safely.

module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { city, days, lat, lon } = req.query;
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "no-api-key" });
  }

  let query = "";
  if (city) {
    query = city;
  } else if (lat && lon) {
    query = `${lat},${lon}`;
  } else {
    return res.status(400).json({ error: "missing-query" });
  }

  const forecastDays = days || 7;
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=${forecastDays}&aqi=no&alerts=no`;

  try {
    const apiResponse = await fetch(url);
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      const errorMessage = data && data.error ? data.error.message : "";
      if (apiResponse.status === 400 && errorMessage.toLowerCase().includes("no matching location")) {
        return res.status(400).json({ error: "city-not-found" });
      }
      if (apiResponse.status === 401 || apiResponse.status === 403) {
        return res.status(401).json({ error: "bad-api-key" });
      }
      return res.status(apiResponse.status).json({ error: "unknown-error" });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "network-error" });
  }
};

# 🌤️ SkyCast — Weather App

A clean, minimal weather app built with plain **HTML, CSS, and JavaScript** — no frameworks, no build tools. Search any city and get current conditions, an hourly forecast, a 7-day forecast, and a full set of weather details, wrapped in a soft glassmorphism UI that shifts color based on the actual weather.

---

## ✨ Features

- 🔍 Search weather by city name
- 📍 "Use my location" button (browser geolocation)
- 🌡️ Current conditions: temperature, feels-like, condition, icon
- ⏰ Hourly forecast (next 24 hours)
- 📅 7-day forecast
- 📊 Full detail stats: humidity, wind, pressure, visibility, UV index, sunrise & sunset
- 🕐 Live clock and date
- 🌗 Dark / light theme toggle (remembered between visits)
- 💀 Loading skeleton while data fetches
- ⚠️ Friendly error messages (bad city, no internet, bad API key)
- 📱 Fully responsive — works on phone, tablet, and desktop
- 🎨 A soft animated background glow that changes color depending on the weather (sunny, rainy, night, snowy, stormy, foggy, cloudy)

---

## 🛠️ Built With

- **HTML5** — semantic markup
- **CSS3** — Flexbox, Grid, CSS variables, `clamp()`, glassmorphism, animations
- **Vanilla JavaScript (ES6+)** — `fetch`, `async/await`, no frameworks
- **[WeatherAPI.com](https://www.weatherapi.com/)** — live weather data
- **[Lucide Icons](https://lucide.dev/)** — icon set, loaded via CDN
- **Google Fonts** — Space Grotesk (headings) + Inter (body text)

No React, Vue, Angular, Bootstrap, Tailwind, or jQuery involved anywhere.

---

## 📁 Folder Structure

```
weather-app/
│
├── index.html          → the page itself (structure only)
├── .gitignore           → tells Git to skip js/config.js (keeps your key private)
│
├── css/
│   ├── style.css        → colors, layout, glass effect, animations
│   └── responsive.css   → phone/tablet breakpoints
│
├── js/
│   ├── utils.js             → small helper functions (dates, storage, rounding)
│   ├── config.example.js  → template showing the shape of config.js (safe to commit)
│   ├── config.js            → your REAL api key goes here (never committed)
│   ├── api.js                 → talks to WeatherAPI.com, nothing else
│   ├── ui.js                   → updates the HTML on screen, nothing else
│   └── app.js                 → connects buttons/search to api.js and ui.js
│
└── assets/
    ├── images/
    └── icons/
```

Each JS file has **one job only**, which makes the project easy to read and edit:

| File       | Responsible for                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------- |
| `utils.js` | Formatting dates/times, reading & writing `localStorage`, rounding numbers                     |
| `api.js`   | Building the request URL and calling `fetch()` — the only file that knows about WeatherAPI.com |
| `ui.js`    | Reading data and writing it into the page — the only file that touches the DOM                 |
| `app.js`   | The "conductor" — listens for clicks/typing and calls the other two files in the right order   |

The files load in this order: `utils.js → api.js → ui.js → app.js` — this matters, since later files use functions defined in earlier ones.

---

## 🚀 Getting Started

### 1. Get a free API key

This app pulls live data from WeatherAPI.com, so you need your own free key:

1. Go to **[weatherapi.com/signup.aspx](https://www.weatherapi.com/signup.aspx)**
2. Create a free account (no credit card needed)
3. Your API key appears right at the top of your dashboard — copy it

### 2. Add your key to the project

This project keeps your real API key **out of Git** using a small config file:

1. Inside the `js/` folder, make a copy of `config.example.js`
2. Rename the copy to `config.js`
3. Open `config.js` and paste your real key in:

```js
const CONFIG = {
  API_KEY: "your-real-key-goes-here",
};
```

## 🎨 How the color-changing background works

The soft glowing background (`.sky-glow` in the HTML) isn't just decoration — it reacts to the weather:

1. When a search succeeds, `getWeatherMood()` in `utils.js` reads the weather description (e.g. `"Light rain"`, `"Clear"`) and sorts it into one of 7 moods: `sunny`, `night`, `rainy`, `snowy`, `stormy`, `foggy`, `cloudy`.
2. `applyGlowMood()` in `ui.js` looks up 3 hex colors for that mood and writes them into CSS variables (`--glow-a`, `--glow-b`, `--glow-c`) on the page.
3. The CSS for `.sky-glow` uses those same variables in its gradient, and has a `transition`, so the moment the variables change, the background fades smoothly to the new colors — no page reload needed.

Example: search a sunny city in the daytime → warm orange glow. Search a city at night in the rain → cool blue-violet glow.

---

## 🧠 How a search works, step by step

1. You type a city and press enter (or click the location button)
2. `app.js` shows the loading skeleton and calls `getForecast(city)` in `api.js`
3. `api.js` builds a URL and calls WeatherAPI.com with `fetch()`
4. If it fails, a plain error code is thrown (`"city-not-found"`, `"network-error"`, etc.) and `app.js` shows a friendly message
5. If it succeeds, `app.js` unpacks the JSON response and hands pieces of it to `ui.js` functions (`renderHero`, `renderHourly`, `renderDaily`, `renderStats`)
6. `ui.js` builds the HTML for each section and drops it onto the page
7. The background glow updates to match the new weather

---

## 🌍 Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Uses `backdrop-filter`, CSS variables, and `fetch` — all standard in any browser released in the last several years.

---

## 🙏 Credits

- Weather data: [WeatherAPI.com](https://www.weatherapi.com/)
- Icons: [Lucide](https://lucide.dev/)
- Fonts: [Google Fonts](https://fonts.google.com/) — Space Grotesk & Inter

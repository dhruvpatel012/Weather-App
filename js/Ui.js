// ui.js

// Colors for the background blob, one set per weather "mood"
const moodColors = {
  sunny: { a: "#f5a962", b: "#f7d774", c: "#1a1330" },
  night: { a: "#6c8ae4", b: "#9b87f5", c: "#050814" },
  rainy: { a: "#5c7ab5", b: "#7d95c9", c: "#0b1120" },
  snowy: { a: "#c9d8f0", b: "#8fa8d6", c: "#0e1526" },
  stormy: { a: "#4a4f7a", b: "#7c5ba6", c: "#0a0a14" },
  foggy: { a: "#9aa5bd", b: "#c2c9d8", c: "#12161f" },
  cloudy: { a: "#7d8bb0", b: "#9b87f5", c: "#0b1120" },
};

// Show the loading skeleton, hide the real content
function showLoading() {
  document.getElementById("skeleton").hidden = false;
  document.getElementById("content").hidden = true;
  hideError();
}

// Hide the loading skeleton, show the real content
function showContent() {
  document.getElementById("skeleton").hidden = true;
  document.getElementById("content").hidden = false;
}

// Show the red error banner at the top with a message
function showError(message) {
  document.getElementById("errorMessage").textContent = message;
  document.getElementById("errorBanner").hidden = false;
}

// Hide the error banner
function hideError() {
  document.getElementById("errorBanner").hidden = true;
}

// Switch between dark and light theme
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  const themeIcon = document.getElementById("themeIcon");
  if (theme === "dark") {
    themeIcon.setAttribute("data-lucide", "moon");
  } else {
    themeIcon.setAttribute("data-lucide", "sun");
  }

  // Lucide needs to redraw icons after we change them
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Change the background colors based on the weather mood
function applyGlowMood(mood) {
  let colors = moodColors[mood];
  if (!colors) {
    colors = moodColors.cloudy;
  }

  document.documentElement.style.setProperty("--glow-a", colors.a);
  document.documentElement.style.setProperty("--glow-b", colors.b);
  document.documentElement.style.setProperty("--glow-c", colors.c);
}

// Update the little date/time line under the city name
function updateDateTime() {
  const now = new Date();
  const text = formatDate(now) + " · " + formatTime(now);
  document.getElementById("dateTime").textContent = text;
}

// Fill in the big hero card (city, icon, temperature, etc.)
function renderHero(location, current) {
  document.getElementById("cityName").textContent = location.name + ", " + location.country;

  const icon = document.getElementById("weatherIcon");
  icon.src = "https:" + current.condition.icon;
  icon.alt = current.condition.text;

  document.getElementById("conditionText").textContent = current.condition.text;
  document.getElementById("temperature").textContent = round(current.temp_c) + "°";
  document.getElementById("feelsLike").textContent = "Feels like " + round(current.feelslike_c) + "°";
}

// Fill in the high/low temperature for today
function renderHighLow(today) {
  const text = "H: " + round(today.maxtemp_c) + "°  L: " + round(today.mintemp_c) + "°";
  document.getElementById("highLow").textContent = text;
}

// Build the hourly forecast row
function renderHourly(hours) {
  const container = document.getElementById("hourlyScroll");
  container.innerHTML = "";

  let count = 0;
  for (let i = 0; i < hours.length; i++) {
    const hour = hours[i];

    // skip hours that already passed
    if (isPastHour(hour.time)) {
      continue;
    }
    // only show the next 24 hours
    if (count >= 24) {
      break;
    }

    const timeLabel = count === 0 ? "Now" : formatHourLabel(hour.time);

    const card = document.createElement("div");
    card.className = "hour-card fade-in";
    card.style.animationDelay = count * 30 + "ms";
    card.innerHTML =
      '<span class="hour-card__time">' + timeLabel + "</span>" +
      '<img src="https:' + hour.condition.icon + '" alt="' + hour.condition.text + '" width="34" height="34" />' +
      '<span class="hour-card__temp">' + round(hour.temp_c) + "°</span>";

    container.appendChild(card);
    count++;
  }
}

// Build the 7-day forecast list
function renderDaily(forecastDays) {
  const container = document.getElementById("dailyList");
  container.innerHTML = "";

  for (let i = 0; i < forecastDays.length; i++) {
    const day = forecastDays[i];
    const dayInfo = day.day;

    const label = i === 0 ? "Today" : formatWeekdayShort(day.date);

    const row = document.createElement("div");
    row.className = "day-row fade-in";
    row.style.animationDelay = i * 40 + "ms";
    row.innerHTML =
      '<span class="day-row__name">' + label + "</span>" +
      '<span class="day-row__condition">' +
        '<img src="https:' + dayInfo.condition.icon + '" alt="' + dayInfo.condition.text + '" width="30" height="30" />' +
        "<span>" + dayInfo.condition.text + "</span>" +
      "</span>" +
      '<span class="day-row__rain"><i data-lucide="droplets"></i>' + dayInfo.daily_chance_of_rain + "%</span>" +
      '<span class="day-row__temps">' +
        '<span class="day-row__high">' + round(dayInfo.maxtemp_c) + "°</span>" +
        '<span class="day-row__low">' + round(dayInfo.mintemp_c) + "°</span>" +
      "</span>";

    container.appendChild(row);
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Turn a UV number into a word, like "Moderate"
function getUvLabel(uv) {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very high";
  return "Extreme";
}

// Build the grid of little stat cards (humidity, wind, pressure, etc.)
function renderStats(current, astro) {
  // Each item: icon name, label, value, sub-text
  const statsList = [
    ["thermometer", "Feels Like", round(current.feelslike_c) + "°", "Perceived temperature"],
    ["droplets", "Humidity", current.humidity + "%", "Relative humidity"],
    ["wind", "Wind Speed", round(current.wind_kph) + " km/h", "From " + current.wind_dir],
    ["gauge", "Pressure", round(current.pressure_mb) + " mb", "Atmospheric pressure"],
    ["eye", "Visibility", current.vis_km + " km", "Distance visible"],
    ["sun", "UV Index", current.uv, getUvLabel(current.uv)],
    ["sunrise", "Sunrise", astro.sunrise, "Local time"],
    ["sunset", "Sunset", astro.sunset, "Local time"],
  ];

  const container = document.getElementById("statsGrid");
  container.innerHTML = "";

  for (let i = 0; i < statsList.length; i++) {
    const icon = statsList[i][0];
    const label = statsList[i][1];
    const value = statsList[i][2];
    const sub = statsList[i][3];

    const card = document.createElement("div");
    card.className = "stat-card fade-in";
    card.style.animationDelay = i * 40 + "ms";
    card.innerHTML =
      '<span class="stat-card__label"><i data-lucide="' + icon + '"></i>' + label + "</span>" +
      '<span class="stat-card__value">' + value + "</span>" +
      '<span class="stat-card__sub">' + sub + "</span>";

    container.appendChild(card);
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
// utils.js

// Turn a Date object into something like "Tuesday, July 14"
function formatDate(date) {
  const options = { weekday: "long", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Turn a Date object into something like "2:30 PM"
function formatTime(date) {
  const options = { hour: "numeric", minute: "2-digit" };
  return date.toLocaleTimeString("en-US", options);
}

// The API gives us dates like "2026-07-14 14:00"
// We just want the hour part, like "2 PM"
function formatHourLabel(dateTimeText) {
  const fixedText = dateTimeText.replace(" ", "T");
  const date = new Date(fixedText);
  return date.toLocaleTimeString("en-US", { hour: "numeric" });
}

// The API gives us dates like "2026-07-14"
// We just want the short weekday, like "Mon"
function formatWeekdayShort(dateText) {
  const date = new Date(dateText + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

// Check if an hour from the API has already passed
function isPastHour(dateTimeText) {
  const fixedText = dateTimeText.replace(" ", "T");
  const hourDate = new Date(fixedText);
  const now = new Date();
  return hourDate.getTime() < now.getTime() - 60 * 60 * 1000;
}

// Just rounds a number, made a function so it reads nicely
function round(value) {
  return Math.round(value);
}

// Save something to localStorage as text (JSON)
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log("Could not save to storage:", error);
  }
}

// Read something back from localStorage
function loadFromStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return fallbackValue;
    }
    return JSON.parse(raw);
  } catch (error) {
    return fallbackValue;
  }
}

// Look at the weather text and decide what "mood" it is.
// We use this to color the background.
function getWeatherMood(conditionText, isDay) {
  const text = conditionText.toLowerCase();

  if (!isDay) {
    return "night";
  }
  if (text.includes("sun") || text.includes("clear")) {
    return "sunny";
  }
  if (text.includes("rain") || text.includes("drizzle") || text.includes("shower")) {
    return "rainy";
  }
  if (text.includes("snow") || text.includes("sleet") || text.includes("ice")) {
    return "snowy";
  }
  if (text.includes("thunder") || text.includes("storm")) {
    return "stormy";
  }
  if (text.includes("fog") || text.includes("mist") || text.includes("haze")) {
    return "foggy";
  }
  return "cloudy";
}
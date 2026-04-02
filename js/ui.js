import { state } from "./state.js";

const weatherIconMap = {
  0: "icon-sunny.webp",
  1: "icon-partly-cloudy.webp",
  2: "icon-partly-cloudy.webp",
  3: "icon-overcast.webp",
  45: "icon-fog.webp",
  48: "icon-fog.webp",
  51: "icon-drizzle.webp",
  53: "icon-drizzle.webp",
  55: "icon-drizzle.webp",
  61: "icon-rain.webp",
  63: "icon-rain.webp",
  65: "icon-rain.webp",
  71: "icon-snow.webp",
  73: "icon-snow.webp",
  75: "icon-snow.webp",
  95: "icon-storm.webp",
};

const locationEl = document.getElementById("location");
const dateEl = document.getElementById("date");
const temperatureEl = document.getElementById("temperature");
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("wind-speed");
const precipitationEl = document.getElementById("precipitation");
const dailyContainer = document.getElementById("daily-forecast-container");
const hourlyContainer = document.getElementById("hourly-forecast-container");
const daySelect = document.getElementById("day-select");

export function renderCurrentWeather(data, city, unit){
    const weatherIconEl = document.getElementById("weather-icon");

    const code = data.current_weather.weathercode;
    const icon = weatherIconMap[code] || "icon-sunny.webp";

    weatherIconEl.src = `./assets/images/${icon}`;

    locationEl.textContent = `${city.name}, ${city.country}`;
    dateEl.textContent = new Date().toDateString();

    temperatureEl.textContent = 
        Math.round(data.current_weather.temperature) + 
        (unit === "metric" ? "°C" : "°F");

    windSpeedEl.textContent =
        data.current_weather.windspeed +
        (unit === "metric" ? " km/h" : " mph");

    const currentTime = data.current_weather.time;

    let currentIndex = data.hourly.time.findIndex(time =>
        time.startsWith(currentTime.slice(0, 13))
    );

    if (currentIndex === -1) currentIndex = 0;

    humidityEl.textContent =
        data.hourly.relativehumidity_2m[currentIndex] + "%";

    let precip = data.hourly.precipitation[currentIndex];

    if (state.precipUnit === "inch") {
        precip = (precip / 25.4).toFixed(2);
        precipitationEl.textContent = precip + " in";
    } else {
        precipitationEl.textContent = precip + " mm";
    }

    feelsLikeEl.textContent = temperatureEl.textContent;
}

export function renderDailyForecast(data){
    dailyContainer.innerHTML = "";

    data.daily.time.forEach((day, index) => {
        const card = document.createElement("div");
        card.classList.add("metric-card");

        const code = data.daily.weathercode?.[index];
        const icon = weatherIconMap[code] || "icon-sunny.webp";

        card.innerHTML = `
            <p class="day-name">
                ${new Date(day).toLocaleDateString("en-US", { weekday: "short"})}
            </p>
            <img src="./assets/images/${icon}" class="forecast-icon"/>
            <div class="temp-row">
                <span class="temp-max">
                    ${Math.round(data.daily.temperature_2m_max[index])}°
                </span>
                <span class="temp-min">
                    ${Math.round(data.daily.temperature_2m_min[index])}°
                </span>
            </div>`;

        dailyContainer.appendChild(card);
    });

    renderDayOptions(data.daily.time);
}

export function renderHourlyForecast(data, dayIndex = 0){
    hourlyContainer.innerHTML = "";

    const currentTime = data.current_weather.time;

    let start = data.hourly.time.findIndex(time =>
        time.startsWith(currentTime.slice(0, 13))
    );

    if (start === -1) start = 0;

    const end = start + 8;

    for(let i = start; i < end; i++){
        const hourItem = document.createElement("div");
        hourItem.classList.add("metric-card");

        const code = data.hourly.weathercode[i];
        const icon = weatherIconMap[code] || "icon-sunny.webp";

        hourItem.innerHTML = `
        <div class="hour-row">
            <div class="hour-left">
                <img src="./assets/images/${icon}" class="hour-icon"/>
                <span>${new Date(data.hourly.time[i]).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    hour12: true
                })}</span>
            </div>
            <span class="hour-temp">${Math.round(data.hourly.temperature_2m[i])}°</span>
        </div>
        `;

        hourlyContainer.appendChild(hourItem);
    }
}

function renderDayOptions(days){
    daySelect.innerHTML = "";

    days.forEach((day, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = new Date(day).toLocaleDateString("en-US", {
            weekday: "long"
        });
        daySelect.appendChild(option);
    });
}

// ✅ FIXED (capital D)
daySelect.addEventListener("change", (e) => {
    renderHourlyForecast(window.__weatherData, e.target.value);
});
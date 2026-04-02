import { state } from "./state.js";
import { fetchCoordinates, fetchWeather } from "./api.js";
import { 
    renderCurrentWeather,
    renderDailyForecast,
    renderHourlyForecast
} from "./ui.js";

const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");

form.addEventListener("submit", handleSearch);

async function handleSearch(e){
    e.preventDefault();

    try{
        const city = await fetchCoordinates(cityInput.value);
        const weather = await fetchWeather(
            city.latitude,
            city.longitude,
            state.unit
        );

        state.city = city;
        state.weatherData = weather;

        window.__weatherData = weather;

        renderCurrentWeather(weather, city, state.unit);
        renderDailyForecast(weather);
        renderHourlyForecast(weather);

    } catch (err){
        alert("City not found");
    }
}

document.addEventListener("DOMContentLoaded", () => {

  const trigger = document.getElementById("unit-trigger");
  const dropdown = document.getElementById("unit-dropdown");
  const options = document.querySelectorAll(".dropdown-option");

  if (!trigger || !dropdown) return;

  // ===== dropdown toggle =====
  trigger.addEventListener("click", () => {
    dropdown.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });

  // ===== dropdown options =====
  options.forEach(option => {
    option.addEventListener("click", async () => {

      if (option.dataset.unit) {
        state.unit = option.dataset.unit;
      }

      if (option.dataset.wind) {
        state.unit = option.dataset.wind === "kmh" ? "metric" : "imperial";
      }

      if (option.dataset.precip) {
        state.precipUnit = option.dataset.precip;
      }

      // ===== UI update =====
      const parent = option.parentElement;

      parent.querySelectorAll(".dropdown-option").forEach(opt => {
        opt.classList.remove("active");
        const check = opt.querySelector(".check");
        if (check) check.remove();
      });

      option.classList.add("active");

      const tick = document.createElement("span");
      tick.classList.add("check");
      tick.textContent = "✓";
      option.appendChild(tick);

      // ===== refetch =====
      if (state.city) {
        const weather = await fetchWeather(
          state.city.latitude,
          state.city.longitude,
          state.unit
        );

        state.weatherData = weather;
        window.__weatherData = weather;

        renderCurrentWeather(weather, state.city, state.unit);
        renderDailyForecast(weather);
        renderHourlyForecast(weather);
      }

    });
  });

});
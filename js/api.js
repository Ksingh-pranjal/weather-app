//Handles all api calls
//====================================
// GEOCODING API
//====================================

export async function fetchCoordinates(city){
    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );

    const data = await response.json();

    if(!data.results){
        throw new Error("City not found");
    }

    const result = data.results[0];

    return{
        name: result.name,
        country: result.country,
        latitude: result.latitude,
        longitude: result.longitude
    };
}

//=====================================
// WEATHER API
//=====================================

export async function fetchWeather(latitude, longitude, unit){
    const unitParams = 
    unit === "metric"
        ? "temperature_unit=celsius&windspeed_unit=kmh"
        : "temperature_unit=fahrenheit&windspeed_unit=mph";
    
    const response = await fetch(
       `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&${unitParams}`
    );

    const data = await response.json();

    return data;
}
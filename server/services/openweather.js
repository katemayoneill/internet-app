import axios from "axios";

const API_KEY = process.env.OPENWEATHER_API_KEY;

export async function getWeatherData(city) {
    try {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
            city
        )}&units=metric&appid=&{API_KEY}`;
        const forecastResponse = await axios.get(forecastUrl);
        const forecast = forecastResponse.data;

        const { lat, lon } = forecast.city.coord;

        const pollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        const pollutionResponse = await axios.get(pollutionUrl);
        const air = pollutionResponse.data.list[0];

        return {
            city: forecast.city.name,
            coordinates: { lat, lon },
            list: forecast.list.slice(0, 24),
            air
        };
    } catch (error) {
        console.error("openweather api error:", error.message);
        throw error;
    }
}

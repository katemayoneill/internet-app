// server/services/openweather.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.OPENWEATHER_KEY;

export async function getWeatherData(city) {
  try {
    if (!API_KEY) {
      console.error("❌ No OpenWeather API key found in environment variables.");
      throw new Error("Server configuration error: missing API key.");
    }

    // Fetch 5-day forecast (3-hour intervals)
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      city
    )}&units=metric&appid=${API_KEY}`;

    console.log("🌍 Fetching forecast for:", forecastUrl);
    const forecastResponse = await axios.get(forecastUrl);
    const forecast = forecastResponse.data;

    if (!forecast.city || !forecast.list) {
      console.error("⚠️ Unexpected forecast data format:", forecast);
      throw new Error("Invalid forecast data received from OpenWeather API.");
    }

    // Extract coordinates for pollution API
    const { lat, lon } = forecast.city.coord;
    const pollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    console.log("🌫️ Fetching air pollution data:", pollutionUrl);

    const pollutionResponse = await axios.get(pollutionUrl);
    const air = pollutionResponse.data.list?.[0];

    if (!air) {
      console.warn("⚠️ No air pollution data received from API.");
    }

    // Return cleaned and structured data
    return {
      city: forecast.city.name,
      coordinates: { lat, lon },
      list: forecast.list.slice(0, 24), // next 3 days (~8 intervals/day)
      air,
    };
  } catch (error) {
    console.error("🔥 OpenWeather API error:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("No response received from API:", error.message);
    } else {
      console.error("Request setup error:", error.message);
    }

    throw new Error("Failed to fetch weather data. Check server logs for details.");
  }
}

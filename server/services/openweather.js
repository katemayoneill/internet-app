import axios from "axios";
import dotenv from "dotenv";

// Load environment variables (from project root)
dotenv.config({ path: "./.env" });

export async function getWeather(city) {
  const key = process.env.OPENWEATHER_KEY;

  if (!key) {
    console.error("❌ OPENWEATHER_KEY missing in .env!");
    throw new Error("Missing API key");
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
    city
  )}&appid=${key}&units=metric`;

  console.log("➡️ Fetching weather data from:", url);

  try {
    const res = await axios.get(url);
    console.log("✅ OpenWeather API responded:", res.status, res.statusText);

    const weatherData = res.data;

    // Extract coordinates from the response
    const coordinates = {
      lat: weatherData.city.coord.lat,
      lon: weatherData.city.coord.lon
    };

    console.log("📍 Coordinates extracted:", coordinates);

    // Fetch air quality data
    let airQuality = null;
    try {
      const airUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${key}`;
      const airRes = await axios.get(airUrl);
      airQuality = airRes.data.list[0];
      console.log("✅ Air quality data fetched");
    } catch (airErr) {
      console.error("⚠️ Air quality fetch failed:", airErr.message);
      // Continue without air quality data
    }

    // Return combined data
    return {
      ...weatherData,
      coordinates,
      air: airQuality
    };
  } catch (err) {
    if (err.response) {
      console.error(
        "🌧️ OpenWeather error:",
        err.response.status,
        err.response.data
      );
    } else {
      console.error("⚙️ Network or Axios error:", err.message);
    }
    throw err;
  }
}

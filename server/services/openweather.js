import axios from "axios";
import dotenv from "dotenv";

// load environment variables from project root
dotenv.config({ path: "./.env" });

export async function getWeather(city) {
  const key = process.env.OPENWEATHER_KEY;

  if (!key) {
    console.error("openweather_key missing in .env");
    throw new Error("Missing API key");
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
    city
  )}&appid=${key}&units=metric`;

  console.log("fetching weather data from:", url);

  try {
    const res = await axios.get(url);
    console.log("openweather api responded:", res.status, res.statusText);

    const weatherData = res.data;

    // extract coordinates from the response
    const coordinates = {
      lat: weatherData.city.coord.lat,
      lon: weatherData.city.coord.lon
    };

    console.log("coordinates extracted:", coordinates);

    // fetch air quality data
    let airQuality = null;
    try {
      const airUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${key}`;
      const airRes = await axios.get(airUrl);
      airQuality = airRes.data.list[0];
      console.log("air quality data fetched");
    } catch (airErr) {
      console.error("air quality fetch failed:", airErr.message);
      // continue without air quality data
    }

    // return combined data
    return {
      ...weatherData,
      coordinates,
      air: airQuality
    };
  } catch (err) {
    if (err.response) {
      console.error(
        "openweather error:",
        err.response.status,
        err.response.data
      );
    } else {
      console.error("network or axios error:", err.message);
    }
    throw err;
  }
}

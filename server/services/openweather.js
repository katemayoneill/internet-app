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
    return res.data;
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

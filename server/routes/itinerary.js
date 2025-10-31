// server/routes/itinerary.js
import express from "express";
import { getSuggestedPlace } from "../services/places.js";

const router = express.Router();

// POST /api/generate-itinerary
router.post("/", async (req, res) => {
  console.log("🗺️ Itinerary generation requested");

  try {
    const { weatherData, coordinates, city } = req.body;

    if (!weatherData || !coordinates) {
      console.error("❌ Missing required data:", {
        hasWeatherData: !!weatherData,
        hasCoordinates: !!coordinates
      });
      return res.status(400).json({ error: "Missing weather data or coordinates" });
    }

    console.log("📍 City:", city || "Unknown");
    console.log("📍 Coordinates:", coordinates);
    console.log("📊 Weather data points:", weatherData.length);

    // Aggregate weather into one summary per day
    const grouped = {};
    for (const entry of weatherData) {
      const day = new Date(entry.dt * 1000).toDateString();
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(entry);
    }

    const days = Object.entries(grouped).slice(0, 3);
    const itinerary = [];

    console.log(`📅 Processing ${days.length} days`);

    for (let i = 0; i < days.length; i++) {
      const [date, entries] = days[i];
      const avgTemp = entries.reduce((s, e) => s + e.main.temp, 0) / entries.length;
      const avgWind = entries.reduce((s, e) => s + e.wind.speed, 0) / entries.length;
      const avgRain = entries.reduce((s, e) => s + (e.rain?.["3h"] || 0), 0) / entries.length;
      const conditions = entries[0].weather[0].description;

      console.log(`Day ${i + 1}: ${conditions}, ${avgTemp.toFixed(1)}°C at ${coordinates.lat}, ${coordinates.lon}`);

      // Get a suitable place suggestion from Google
      const venue = await getSuggestedPlace(conditions, coordinates);

      console.log(`✅ Venue found: ${venue.name} at ${venue.address}`);

      itinerary.push({
        day: i + 1,
        date,
        weather: {
          temp: avgTemp.toFixed(1),
          condition: conditions,
          wind: (avgWind * 3.6).toFixed(1),
          rain: avgRain.toFixed(1)
        },
        venue
      });
    }

    console.log("✅ Itinerary generated successfully with", itinerary.length, "days");
    res.json({ itinerary });
  } catch (error) {
    console.error("❌ Itinerary generation failed:", error.message);
    console.error(error.stack);
    res.status(500).json({
      error: "Failed to generate itinerary",
      details: error.message
    });
  }
});

export default router;

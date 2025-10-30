// server/routes/itinerary.js
import express from "express";
import { getSuggestedPlace } from "../services/places.js";

const router = express.Router();

// POST /api/generate-itinerary
router.post("/", async (req, res) => {
  try {
    const { weatherData, coordinates } = req.body;
    if (!weatherData || !coordinates) {
      return res.status(400).json({ error: "Missing weather data or coordinates" });
    }

    // Aggregate weather into one summary per day
    const grouped = {};
    for (const entry of weatherData) {
      const day = new Date(entry.dt * 1000).toDateString();
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(entry);
    }

    const days = Object.entries(grouped).slice(0, 3);
    const itinerary = [];

    for (let i = 0; i < days.length; i++) {
      const [date, entries] = days[i];
      const avgTemp = entries.reduce((s, e) => s + e.main.temp, 0) / entries.length;
      const avgWind = entries.reduce((s, e) => s + e.wind.speed, 0) / entries.length;
      const avgRain = entries.reduce((s, e) => s + (e.rain?.["3h"] || 0), 0) / entries.length;
      const conditions = entries[0].weather[0].description;

      // Get a suitable place suggestion from Google
      const venue = await getSuggestedPlace(conditions, coordinates);

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

    res.json({ itinerary });
  } catch (error) {
    console.error("Itinerary generation failed:", error.message);
    res.status(500).json({ error: "Failed to generate itinerary" });
  }
});

export default router;

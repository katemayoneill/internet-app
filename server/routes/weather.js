// server/routes/weather.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const expressPath = require.resolve("express");
console.log("Express from:", expressPath);

import express from "express";
import { getWeather } from "../services/openweather.js";

const router = express.Router();

console.log(">>> weather.js loaded"); // confirm file loaded

router.get("/", async (req, res) => {
  const city = req.query.city;
  console.log("🌍 Weather route called for:", city);

  try {
    const data = await getWeather(city);
    console.log("✅ Weather data fetched successfully for:", city);
    res.json(data);
  } catch (err) {
    console.error("❌ Weather fetch failed:", err.message);
    res.status(500).json({ error: "failed to fetch weather data :(" });
  }
});

console.log("Route stack length:", router.stack?.length);
router.stack?.forEach((r, i) => {
  console.log(`  [${i}]`, r.route?.path, r.route?.methods);
});


export default router;

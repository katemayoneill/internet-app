import express from "express";
import { getWeather } from "../services/openweather.js";

const router = express.Router();

console.log("weather route loaded");

router.get("/", async (req, res) => {
  const city = req.query.city;
  console.log("weather route called for:", city);

  try {
    const data = await getWeather(city);
    console.log("weather data fetched for:", city);
    res.json(data);
  } catch (err) {
    console.error("weather fetch failed:", err.message);
    res.status(500).json({ error: "failed to fetch weather data" });
  }
});

console.log("route stack length:", router.stack?.length);
router.stack?.forEach((r, i) => {
  console.log(`  [${i}]`, r.route?.path, r.route?.methods);
});


export default router;

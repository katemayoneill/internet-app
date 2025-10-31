import express from "express";
import { getWeatherData } from "../services/openweather.js";

const router = express.Router();

// GET  /api/weather?city=Dublin
router.get("/", async (req, res) => {
    try {
        const { city } = req.query;
        console.log("weather route hit for: ", city);
        if (!city) {
            return res.status(400).json({ error: "city parameter is required" });
        }

        const data = await getWeatherData(city);
        res.json(data);
    } catch (error) {
        console.error("error fetching weather data", error.message);
        res.status(500).json({ error: "failed to fetch weather data :(" });
    }
});

export default router;

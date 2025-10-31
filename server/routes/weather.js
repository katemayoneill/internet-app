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
        const status = error.status || 500;
        const response = {
            error: error.message || "failed to fetch weather data :("
        };

        if (error.apiData) {
            response.apiData = error.apiData;
        }

        console.error("error fetching weather data", error.message);
        res.status(status).json(response);
    }
});

export default router;

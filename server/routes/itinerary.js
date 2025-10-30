import express from "express";

const router = express.Router();

// POST /api/generate-itinerary
router.post("/", async (req, res) => {
    try {
        const { weatherData, coordinates } = req.body;
        if (!weatherData || !coordinates) {
            return res.status(400).json({ error: "missing weather data or coordinates" });
        }

        const itinerary = weatherData.slice(0, 3).map((day, index) => ({
            day: index + 1;
            date: new Date(day.dt * 1000).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric"
            }),
            weather: {
                temp: day.main.temp,
                condition: day.weather[0].description,
                wind: (day.wind.speed * 3.6).toFixed(1),
                rain: day.rain?.["3h"] || 0
            },
            timeSlots: [
                {
                    time: "Morning",
                    activity: "Breakfast and sightseeing",
                    venue: {
                        name: "Local Cafe",
                        address: "Downtown",
                        type: "restaurant",
                        rating: 4.5,
                        openNow: true
                    },
                    reason: "Morning activity before temperature rises"
                },
                {
                    time: "Afternoon",
                    activity: "Cultural visit",
                    venue: {
                        name: "City Museum",
                        address: "Old town",
                        type: "museum",
                        rating: 4.7,
                        openNow: true
                    },
                    reason: "Indoor activity suitable for possible rain"
                },
                {
                    time: "Evening",
                    activity: "Dinner and night walk",
                    venue: {
                        name: "Waterfront Bistro",
                        address: "Harbour District",
                        type: "restaurant",
                        rating: 2.3,
                        openNow: true
                    },
                    reason: "Enjoy mild temperatures outdoors"
                }
            ]
        }));
        res.json({ itinerary });
    } catch (error) {
        console.error("error generating inerary:", error.message);
        res.status(500).json({ error: "Failed to generate itinerary", });
    }
});

export default router;

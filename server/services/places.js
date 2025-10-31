import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function getSuggestedPlace(weather, { lat, lon }) {
    let query = "tourist attraction";

    if (weather.includes("rain") || weather.includes("storm")) {
        query = "museum|art gallery|indoor attraction";
    } else if (weather.includes("clear") || weather.includes("sun")) {
        query = "park|beach|outdoor cafe";
    } else if (weather.includes("cloud")) {
        query = "restaurant|coffee shop";
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&keyword=${encodeURIComponent(query)}&key=${API_KEY}`;

    try {
        const res = await axios.get(url);
        if (!res.data.results || res.data.results.length == 0) {
            return {
                name: "no suitable places found nearby :(",
                address: "N/A",
                type: query,
                rating: "N/A",
                openNow: null
            };
        }

        const place = res.data.results[Math.floor(Math.random() * Math.min(res.data.results.length, 5))];

        return {
            name: place.name,
            address: place.vicinity || "Unknown",
            type: place.types[0] || query,
            rating: place.rating || "N/A",
            openNow: place.opening_hours?.open_now ?? null
        };
    } catch (error) {
        console.error("Google places api error:", error.message);
        return {
            name: "error fetching data",
            address: "N/A",
            type: query,
            rating: "N/A",
            openNow: null
        };
    }
}

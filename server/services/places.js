import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function getSuggestedPlace(weather, { lat, lon }) {
    if (!API_KEY) {
        console.error("❌ GOOGLE_PLACES_API_KEY missing in .env!");
        return {
            name: "API key not configured",
            address: "Please add GOOGLE_PLACES_API_KEY to your .env file",
            type: "error",
            rating: "N/A",
            openNow: null
        };
    }

    let query = "tourist attraction";

    if (weather.includes("rain") || weather.includes("storm")) {
        query = "museum";
    } else if (weather.includes("clear") || weather.includes("sun")) {
        query = "park";
    } else if (weather.includes("cloud")) {
        query = "restaurant";
    }

    // Using the NEW Places API (Text Search)
    // Docs: https://developers.google.com/maps/documentation/places/web-service/text-search
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}+near+${lat},${lon}&radius=5000&key=${API_KEY}`;

    console.log(`🗺️ Fetching Google Places for weather: ${weather}`);
    console.log(`📍 Location: ${lat}, ${lon}`);
    console.log(`🔍 Query: ${query}`);

    try {
        const res = await axios.get(url);

        console.log(`✅ Google Places API responded: ${res.status}`);
        console.log(`📊 Results found: ${res.data.results?.length || 0}`);

        if (res.data.status !== "OK" && res.data.status !== "ZERO_RESULTS") {
            console.error("⚠️ Google Places API error status:", res.data.status);
            if (res.data.error_message) {
                console.error("⚠️ Error message:", res.data.error_message);
            }
        }

        if (!res.data.results || res.data.results.length === 0) {
            return {
                name: "No suitable places found nearby :(",
                address: "Try a different location or check your API configuration",
                type: query,
                rating: "N/A",
                openNow: null
            };
        }

        // Pick a random place from top 5 results
        const topResults = res.data.results.slice(0, Math.min(5, res.data.results.length));
        const place = topResults[Math.floor(Math.random() * topResults.length)];

        console.log(`✨ Selected place: ${place.name}`);

        return {
            name: place.name,
            address: place.formatted_address || "Unknown",
            type: place.types?.[0] || query,
            rating: place.rating || "N/A",
            openNow: place.opening_hours?.open_now ?? null
        };
    } catch (error) {
        console.error("❌ Google Places API error:", error.message);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
        return {
            name: "Error fetching places",
            address: error.message || "Unknown error",
            type: query,
            rating: "N/A",
            openNow: null
        };
    }
}

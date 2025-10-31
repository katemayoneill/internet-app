import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function getSuggestedPlace(weather, { lat, lon }) {
  if (!API_KEY) {
    console.error("google_places_api_key missing in .env");
    return {
      name: "API key not configured",
      address: "Please add GOOGLE_PLACES_API_KEY to your .env file",
      type: "error",
      rating: "N/A",
      openNow: null
    };
  }

  let type = "tourist_attraction";

  if (weather.includes("rain") || weather.includes("storm")) {
    type = "museum";
  } else if (weather.includes("clear") || weather.includes("sun")) {
    type = "park";
  } else if (weather.includes("cloud")) {
    type = "restaurant";
  }

  // use nearby search for location-based results
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=${type}&key=${API_KEY}`;

  console.log(`fetching google places for weather: ${weather}`);
  console.log(`location: ${lat}, ${lon}`);
  console.log(`type: ${type}`);
  console.log(`api url: ${url.replace(API_KEY, "HIDDEN")}`);

  try {
    const res = await axios.get(url);

    console.log(`google places api responded: ${res.status}`);
    console.log(`results found: ${res.data.results?.length || 0}`);

    if (res.data.status !== "OK" && res.data.status !== "ZERO_RESULTS") {
      console.error("google places api error status:", res.data.status);
      if (res.data.error_message) {
        console.error("error message:", res.data.error_message);
      }
    }

    if (!res.data.results || res.data.results.length === 0) {
      return {
        name: "No suitable places found nearby",
        address: `Try a different location (searched near ${lat}, ${lon})`,
        type: type,
        rating: "N/A",
        openNow: null
      };
    }

    // choose randomly from the top results
    const topResults = res.data.results.slice(0, Math.min(5, res.data.results.length));
    const place = topResults[Math.floor(Math.random() * topResults.length)];

    console.log(`selected place: ${place.name}`);
    console.log(
      `place location: ${place.geometry?.location?.lat}, ${place.geometry?.location?.lng}`
    );

    return {
      name: place.name,
      address: place.vicinity || place.formatted_address || "Address not available",
      type: place.types?.[0] || type,
      rating: place.rating || "N/A",
      openNow: place.opening_hours?.open_now ?? null
    };
  } catch (error) {
    console.error("google places api error:", error.message);
    if (error.response) {
      console.error("response status:", error.response.status);
      console.error("response data:", error.response.data);
    }
    return {
      name: "Error fetching places",
      address: error.message || "Unknown error",
      type: type,
      rating: "N/A",
      openNow: null
    };
  }
}

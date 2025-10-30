const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 4000;

app.get('/api/weather', async (req, res) => {
  const city = req.query.city || 'Dublin';
  try {
    // 3-day forecast
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.OPENWEATHER_KEY}&units=metric`;
    const { data } = await axios.get(url);
    const list = data.list.filter((_, i) => i % 8 === 0).slice(0, 3);

    // Air pollution
    const { lat, lon } = data.city.coord;
    const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_KEY}`;
    const { data: air } = await axios.get(airUrl);

    res.json({
      list,
      air: air.list[0],
      city: data.city,
      coordinates: { lat, lon }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// INNOVATIVE FEATURE: Smart Itinerary Generator with Google Places
app.post('/api/generate-itinerary', async (req, res) => {
  const { weatherData, coordinates } = req.body;

  try {
    const itinerary = [];

    for (let i = 0; i < weatherData.length; i++) {
      const day = weatherData[i];
      const dayPlan = await generateDayPlan(day, coordinates, i + 1);
      itinerary.push(dayPlan);
    }

    res.json({ itinerary });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

async function generateDayPlan(dayWeather, coords, dayNumber) {
  const temp = dayWeather.main.temp;
  const rain = dayWeather.rain?.['3h'] || 0;
  const windSpeed = dayWeather.wind.speed * 3.6;
  const date = new Date(dayWeather.dt * 1000);

  // Determine weather suitability
  const isRainy = rain > 0;
  const isHot = temp > 24;
  const isCold = temp < 8;
  const isWindy = windSpeed > 30;

  const plan = {
    day: dayNumber,
    date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    weather: {
      temp,
      condition: dayWeather.weather[0].description,
      rain,
      wind: windSpeed.toFixed(1)
    },
    timeSlots: []
  };

  // Morning slot (9am-12pm)
  if (isRainy || isCold) {
    const museum = await findPlace(coords, 'museum', 'morning cultural experience');
    plan.timeSlots.push({
      time: '9:00 AM - 12:00 PM',
      activity: 'Indoor Cultural Experience',
      venue: museum,
      reason: isRainy ? 'Rain protection' : 'Warm indoor environment'
    });
  } else {
    const park = await findPlace(coords, 'park', 'morning outdoor activity');
    plan.timeSlots.push({
      time: '9:00 AM - 12:00 PM',
      activity: 'Outdoor Exploration',
      venue: park,
      reason: 'Perfect weather for outdoor activities'
    });
  }

  // Lunch slot (12pm-2pm)
  const restaurant = await findPlace(coords, 'restaurant', 'lunch spot');
  plan.timeSlots.push({
    time: '12:00 PM - 2:00 PM',
    activity: 'Lunch Break',
    venue: restaurant,
    reason: 'Refuel and relax'
  });

  // Afternoon slot (2pm-6pm)
  if (isRainy || isWindy) {
    const attraction = await findPlace(coords, 'tourist_attraction', 'afternoon indoor attraction');
    plan.timeSlots.push({
      time: '2:00 PM - 6:00 PM',
      activity: 'Indoor Attraction',
      venue: attraction,
      reason: isRainy ? 'Stay dry' : 'Wind protection'
    });
  } else if (isHot) {
    const cafe = await findPlace(coords, 'cafe', 'afternoon refreshment');
    plan.timeSlots.push({
      time: '2:00 PM - 6:00 PM',
      activity: 'Relaxed Afternoon',
      venue: cafe,
      reason: 'Cool down in comfortable setting'
    });
  } else {
    const shopping = await findPlace(coords, 'shopping_mall', 'afternoon shopping');
    plan.timeSlots.push({
      time: '2:00 PM - 6:00 PM',
      activity: 'Shopping & Exploration',
      venue: shopping,
      reason: 'Comfortable weather for walking around'
    });
  }

  // Evening slot (6pm-9pm)
  const nightlife = await findPlace(coords, 'night_club|bar', 'evening entertainment');
  plan.timeSlots.push({
    time: '6:00 PM - 9:00 PM',
    activity: 'Evening Entertainment',
    venue: nightlife,
    reason: 'End the day with local culture'
  });

  return plan;
}

async function findPlace(coords, type, context) {
  try {
    // Google Places Nearby Search
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const params = {
      location: `${coords.lat},${coords.lon}`,
      radius: 5000, // 5km radius
      type: type.split('|')[0], // Take first type if multiple
      key: process.env.GOOGLE_PLACES_KEY
    };

    const { data } = await axios.get(url, { params });

    if (data.results && data.results.length > 0) {
      // Get top-rated place
      const sortedPlaces = data.results
        .filter(p => p.rating && p.rating >= 3.5)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));

      const place = sortedPlaces[0] || data.results[0];

      return {
        name: place.name,
        rating: place.rating || 'N/A',
        address: place.vicinity,
        type: place.types[0].replace(/_/g, ' '),
        openNow: place.opening_hours?.open_now,
        placeId: place.place_id,
        location: place.geometry.location
      };
    }

    // Fallback if API fails or no results
    return {
      name: `Local ${type.replace(/_/g, ' ')}`,
      rating: 'N/A',
      address: 'City center',
      type: type.replace(/_/g, ' '),
      openNow: null
    };

  } catch (error) {
    console.error(`Error fetching place for ${type}:`, error.message);
    // Return fallback data
    return {
      name: `Recommended ${type.replace(/_/g, ' ')}`,
      rating: 'N/A',
      address: 'Near city center',
      type: type.replace(/_/g, ' '),
      openNow: null
    };
  }
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

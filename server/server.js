const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

console.log("API key:", process.env.OPENWEATHER_KEY);

const app = express();
app.use(cors());
const PORT = 4000;

app.get('/api/weather', async (req, res) => {
  const city = req.query.city || 'Dublin';
  try {
    // 3-day forecast
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.OPENWEATHER_KEY}&units=metric`;
    const { data } = await axios.get(url);
    const list = data.list.filter((_, i) => i % 8 === 0).slice(0, 3); // noon each day

    // Air pollution
    const { lat, lon } = data.city.coord;
    const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_KEY}`;
    const { data: air } = await axios.get(airUrl);

    res.json({ list, air: air.list[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

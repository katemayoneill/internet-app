const { createApp } = Vue;

createApp({
  data() {
    return {
      city: 'Dublin',
      result: null,
      error: null,
      loading: false,
      itinerary: [],
      itineraryTried: false,
      generatingItinerary: false
    };
  },
  computed: {
    days() {
      return this.result?.list || [];
    },
    bringUmbrella() {
      return this.days.some(d => (d.rain?.['3h'] || 0) > 0);
    },
    packLevel() {
      const temps = this.days.map(d => d.main.temp);
      if (temps.length === 0) return '—';
      const maxT = Math.max(...temps);
      return maxT > 24 ? 'Hot' : maxT < 8 ? 'Cold' : 'Mild';
    },
    tempRange() {
      const temps = this.days.map(d => d.main.temp);
      if (temps.length === 0) return '—';
      const min = Math.min(...temps).toFixed(1);
      const max = Math.max(...temps).toFixed(1);
      return `${min} – ${max}`;
    },
    airWarning() {
      const a = this.result?.air;
      if (!a?.main?.aqi || a.main.aqi === 1) return '';

      const aqi = a.main.aqi;
      const aqiLevels = {
        2: { level: 'Fair', risk: 'Acceptable for most, but sensitive individuals may experience minor breathing discomfort' },
        3: { level: 'Moderate', risk: 'Sensitive groups may experience breathing discomfort; general public unaffected' },
        4: { level: 'Poor', risk: 'Everyone may experience breathing discomfort; sensitive groups should limit outdoor activity' },
        5: { level: 'Very Poor', risk: 'Health alert: everyone may experience serious health effects; avoid outdoor activity' }
      };

      const info = aqiLevels[aqi];
      if (!info) return '';

      const c = a.components;

      let details = `Air Quality: ${info.level} (AQI ${aqi}/5). ${info.risk}. `;

      // Add specific pollutant details
      if (c?.pm2_5 > 10) details += `PM2.5: ${c.pm2_5.toFixed(1)} µg/m³. `;
      if (c?.no2 > 40) details += `NO₂: ${c.no2.toFixed(1)} µg/m³. `;
      if (c?.o3 > 60) details += `O₃: ${c.o3.toFixed(1)} µg/m³. `;

      return details;
    }
  },
  methods: {
    async loadWeather() {
      this.loading = true;
      this.error = null;
      this.result = null;
      this.itinerary = [];
      this.itineraryTried = false;

      try {
        const res = await fetch(`http://localhost:4000/api/weather?city=${encodeURIComponent(this.city)}`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        this.result = data;
      } catch (e) {
        this.error = e.message || 'Failed to load weather.';
      } finally {
        this.loading = false;
      }
    },
    async generateItinerary() {
      if (!this.result) return;

      console.log('🌍 Generating itinerary for:', this.city);
      console.log('📍 Using coordinates:', this.result.coordinates);

      this.generatingItinerary = true;
      this.itineraryTried = true;
      this.error = null;
      this.itinerary = [];

      try {
        const payload = {
          weatherData: this.result.list,
          coordinates: this.result.coordinates,
          city: this.city
        };

        console.log('📤 Sending payload:', payload);

        const res = await fetch('http://localhost:4000/api/generate-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        console.log('✅ Itinerary received:', data.itinerary);
        this.itinerary = data.itinerary || [];
      } catch (e) {
        this.error = 'Failed to generate itinerary: ' + (e.message || '');
        console.error('❌ Itinerary error:', e);
      } finally {
        this.generatingItinerary = false;
      }
    },
    formatDate(ts) {
      return new Date(ts * 1000).toLocaleDateString('en-IE', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  },
  mounted() {
    this.loadWeather();
  }
}).mount('#app');

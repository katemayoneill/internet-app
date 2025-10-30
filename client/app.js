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
      if (!a?.components) return '';
      const c = a.components;
      if (c.pm2_5 > 10) return `PM2.5 elevated (${c.pm2_5.toFixed(1)} µg/m³) – sensitive groups reduce outdoor activity.`;
      if (c.no2 > 40) return `NO₂ elevated (${c.no2.toFixed(1)} µg/m³) – may irritate airways.`;
      if (c.o3 > 60) return `Ozone elevated (${c.o3.toFixed(1)} µg/m³) – limit prolonged outdoor exertion.`;
      return '';
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
      this.generatingItinerary = true;
      this.itineraryTried = true;
      this.error = null;
      this.itinerary = [];
      try {
        const res = await fetch('http://localhost:4000/api/generate-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weatherData: this.result.list,
            coordinates: this.result.coordinates
          })
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        this.itinerary = data.itinerary || [];
      } catch (e) {
        this.error = 'Failed to generate itinerary: ' + (e.message || '');
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

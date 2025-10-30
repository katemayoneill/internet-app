/*app js file*/

const { createApp } = Vue;

createApp({
  data() {
    return {
      city: "",
      result: null,
      error: null
    };
  },
  methods: {
    async loadWeather() {
      this.error = null;
      this.result = null;
      if (!this.city) {
        this.error = "Please enter a city name.";
        return;
      }
      try {
        const res = await fetch(`http://localhost:3000/api/weather?city=${encodeURIComponent(this.city)}`);
        if (!res.ok) throw new Error("Server error");
        this.result = await res.json();
      } catch (e) {
        this.error = e.message;
      }
    }
  }
}).mount("#app");

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const expressPath = require.resolve("express");
console.log("Express from:", expressPath);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import listEndpoints from "express-list-endpoints";

dotenv.config({ path: "../.env" });

import weatherRouter from "./routes/weather.js";
import itineraryRouter from "./routes/itinerary.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Mount routers BEFORE listEndpoints and app.listen
app.use("/api/weather", weatherRouter);
app.use("/api/generate-itinerary", itineraryRouter); // Fixed: Changed from /api/itinerary

console.log("Registered endpoints:", JSON.stringify(listEndpoints(app), null, 2));

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Weather endpoint: http://localhost:${PORT}/api/weather`);
  console.log(`📍 Itinerary endpoint: http://localhost:${PORT}/api/generate-itinerary`);
});

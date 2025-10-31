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

// mount routers before listing endpoints
app.use("/api/weather", weatherRouter);
app.use("/api/generate-itinerary", itineraryRouter);

console.log("registered endpoints:", JSON.stringify(listEndpoints(app), null, 2));

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
  console.log(`weather endpoint: http://localhost:${PORT}/api/weather`);
  console.log(`itinerary endpoint: http://localhost:${PORT}/api/generate-itinerary`);
});

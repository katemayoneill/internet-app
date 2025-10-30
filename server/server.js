import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import weatherRouter from "./routes/weather.js";
import itineraryRouter from "./routes/itinerary.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// mount route modules
app.use("/api/weather", weatherRouter);
app.use("/api/generate-itinerary", itineraryRouter);

// check if working

app.get("", (req, res) => res.send("weather packer api running :P"));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`server running at http://localhost:${PORT}`));


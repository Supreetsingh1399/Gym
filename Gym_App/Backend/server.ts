import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import {
  registerUser,
  getAllUsers,
  healthCheck,
} from "./controllers/User_controls";
import { getAllGyms, registerGym } from "./controllers/Gym_controls";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const Port = process.env.PORT || 11890;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri)
      throw new Error("MongoDB URI is missing in environment variables");

    await mongoose.connect(uri);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Routes using controllers
app.post("/Register/Users", registerUser);
app.get("/Register/Users", getAllUsers);
app.post("/Register/Gyms", registerGym);
app.get("/Register/Gyms", getAllGyms);
app.get("/health", healthCheck);

// Start Server
connectDB()
  .then(() => {
    app.listen(Port, () => {
      console.log(`Server running on port ${Port}`);
    });
  })
  .catch((err) => {
    console.error("Server startup failed:", err);
  });

export default app;

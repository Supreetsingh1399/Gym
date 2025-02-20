import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import Trainer from "./Models/Trainer_model";
import User from "./Models/User_models";

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

// Connect and start server
connectDB()
  .then(() => {
    app.listen(Port, () => {
      console.log(`Server running on port ${Port}`);
    });
  })
  .catch((err) => {
    console.error("Server startup failed:", err);
  });

// Post Routes to database
app.post("/Register/Trainers", async (req: Request, res: Response) => {
  try {
    const newTrainer = new Trainer(req.body);
    const savedTrainer = await newTrainer.save();
    res.status(201).json({
      success: true,

      message: "Trainer registered successfully!",
      data: savedTrainer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Registration failed.",
    });
  }
});
app.post("/Register/Users", async (req: Request, res: Response) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      data: savedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Registration failed.",
    });
  }
});
// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).send({ status: "Server is healthy" });
});

// GET route for trainers
app.get("/Register/Trainers", async (req: Request, res: Response) => {
  try {
    const trainers = await Trainer.find();
    console.log("Fetched trainers:", trainers); // Debug log
    res.status(200).json({
      success: true,
      data: trainers,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch trainers",
    });
  }
});
//update trainer  by id
app.put("/Register/Trainers/:id", async (req: Request, res: Response) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({
      success: true,
      data: trainer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update trainer",
    });
  }
});
//Delete trainer by id
app.delete("/Register/Trainers/:id", async (req: Request, res: Response) => {
  try {
    await Trainer.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Trainer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete trainer",
    });
  }
});
//get routes from users
app.get("/Register/Users", async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    console.log("Fetched users:", users); // Debug log
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch users",
    });
  }
});

export default app;

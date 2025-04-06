import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import {
  registerUser,
  getAllUsers,
  healthCheck,
} from "./controllers/User_controls";
import {
  approveGym,
  deleteGym,
  getAllGyms,
  registerGym,
  getUserGyms,
  getGymById,
} from "./controllers/Gym_controls"; // Import the Gym model
import Gym from "./Models/Gym_Register";
import User from "./Models/User_models"; // Import the User model

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const router = express.Router();
const app = express();
const Port = process.env.PORT || 11890;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

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

// Define routes with proper request/response typing
router.post("/Register/Users", (req: Request, res: Response) =>
  registerUser(req, res),
);
router.get("/Register/Users", (req: Request, res: Response) =>
  getAllUsers(req, res),
);
router.post("/Register/Gyms", (req: Request, res: Response) =>
  registerGym(req, res),
);
router.get("/Register/Gyms", (req: Request, res: Response) =>
  getAllGyms(req, res),
);
// Get a specific gym by ID
router.get('/Register/Gyms/:id', getGymById);
router.put(
  "/Register/Gyms/:id/approve",
  async (req: Request, res: Response) => {
    try {
      await approveGym(req, res);
    } catch (error) {
      res.status(500).send({ error: "Internal Server Error" });
    }
  },
);
router.delete("/Register/Gyms/:id", async (req: Request, res: Response) => {
  try {
    await deleteGym(req, res);
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});
// Add this route to get gyms for a specific user
router.get("/Register/Gyms/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userGyms = await Gym.find({ userId: userId });

    res.status(200).json({ gyms: userGyms });
  } catch (error) {
    console.error("Error fetching user gyms:", error);
    res.status(500).json({ error: "Failed to fetch user gyms" });
  }
});
// Add this route to get a specific user by ID
//@ts-ignore
router.get("/Register/Users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Use findById instead of find for looking up by _id
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    
    // Check if it's an invalid ID format error
    if (error instanceof Error && error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Use router
app.use("/", router);

// ...existing connection and server code...
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

import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./db"; // Import MongoDB connection file
// import trainerRoutes from "../routes/trainerRoutes"; // Trainer Routes
import userRoutes from "./Routes/User_routes"; // User Routes

const app = express();
const PORT = process.env.PORT || 11890;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB before starting the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error("Server startup failed:", err);
  });

// Routes
// app.use("/api/trainers", trainerRoutes);
app.use("/users", userRoutes);

// Health Check Route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).send({ status: "Server is healthy" });
});

export default app;

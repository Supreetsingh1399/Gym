import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./db";
import userRoutes from "./Routes/User_routes";

const app = express();
const PORT = process.env.PORT || 11890;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - use only one route registration
app.use("/api/users", userRoutes);

// Health Check Route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).send({ status: "Server is healthy" });
});

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

export default app;
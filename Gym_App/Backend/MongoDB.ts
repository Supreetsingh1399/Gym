import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
// Configure dotenv with correct path
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Debug log for MongoDB URI
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);

const MONGODB_URI = process.env.MONGODB_URI;

const MongoDB = async (): Promise<void> => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    if (error instanceof Error) {
      console.error("MongoDB Connection Error:", error.message);
      process.exit(1);
    } else {
      console.error("Unexpected error during MongoDB connection:", error);
      process.exit(1);
    }
  }
};

// Immediately invoke the connection
MongoDB().catch(console.error);

export default MongoDB;
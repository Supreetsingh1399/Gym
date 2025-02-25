import express from "express";
import { registerUser } from "../controllers/User_controls";

const router = express.Router();

// Route to register a new user
router.post("/register", async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "User registration failed.",
    });
  }
});

export default router;

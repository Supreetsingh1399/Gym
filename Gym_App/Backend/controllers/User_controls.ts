import { Request, Response } from "express";
import User from "../Models/User_models";

// Register a new user
export const registerUser = async (req: Request, res: Response) => {
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
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch users",
    });
  }
};

// Health check
export const healthCheck = (req: Request, res: Response) => {
  res.status(200).send({ status: "Server is healthy" });
};

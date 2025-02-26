import { Request, Response } from "express";
import Gym from "../Models/Gym_Register";
//Resgister new Gym
export const registerGym = async (req: Request, res: Response) => {
  try {
    const newGym = new Gym(req.body);
    const savedGym = await newGym.save();
    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      data: savedGym,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Registration failed.",
    });
  }
};
// Get all Gyms
export const getAllGyms = async (req: Request, res: Response) => {
  try {
    const users = await Gym.find();
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

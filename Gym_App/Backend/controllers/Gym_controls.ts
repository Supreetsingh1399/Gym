import { Request, Response } from "express";
import Gym from "../Models/Gym_Register";
//Register new Gym
export const registerGym = async (req: Request, res: Response) => {
  try {
    const newGym = new Gym(req.body);
    const savedGym = await newGym.save();
    res.status(201).json({
      success: true,
      message: "Gym registered successfully! Wait for admin approval",
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
//Approve Gym
export const approveGym = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedGym = await Gym.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true },
    );

    if (!updatedGym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedGym,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to approve gym",
    });
  }
};
//Delete Gym
export const deleteGym = async (req: Request, res: Response) => {
  try {
    const gymId = req.params.id;
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }
    await Gym.findByIdAndDelete(gymId);
    res.status(200).json({
      success: true,
      message: "Gym deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete gym",
    });
  }
};
//Update Gym
export const updateGym = async (req: Request, res: Response) => {
  try {
    const gymId = req.params.id;
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }
    const updatedGym = await Gym.findByIdAndUpdate(gymId, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      message: "Gym updated successfully",
      data: updatedGym,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update gym",
    });
  }
};
// In controllers/Gym_controls.ts
export const getUserGyms = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const userGyms = await Gym.find({ userId: userId });

    res.status(200).json({ gyms: userGyms });
  } catch (error) {
    console.error("Error fetching user gyms:", error);
    res.status(500).json({ error: "Failed to fetch user gyms" });
  }
};
export const getGymById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Gym ID is required" });
    }

    const gym = await Gym.findById(id);
    
    if (!gym) {
      return res.status(404).json({ error: "Gym not found" });
    }

    res.status(200).json({ gym });
  } catch (error) {
    console.error("Error fetching gym:", error);
    res.status(500).json({ error: "Failed to fetch gym" });
  }
};

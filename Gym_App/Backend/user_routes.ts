import express from "express";
import { registerUser, getUsers } from "./controllers/User_controls";

const router = express.Router();

router.post("/", registerUser);
router.get("/", getUsers);

export default router;

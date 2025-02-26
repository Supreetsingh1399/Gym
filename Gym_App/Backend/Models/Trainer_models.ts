import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => /^\d{10}$/.test(v),
      message: "Phone number must be 10 digits",
    },
  },
  specialization: [String],
  certifications: [String],
  experienceYears: { type: Number, required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true }, // Associated Gym
  status: { type: String, default: "active" }, // Active, Pending, or Suspended
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Trainer", trainerSchema);

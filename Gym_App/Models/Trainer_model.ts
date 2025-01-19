import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: Int32Array, required: true },
  gymName: { type: String, required: true },
  gymAddress: { type: String, required: true },
  gymCity: { type: String, required: true },
  gymPhone: { type: Int32Array, required: true },
  gymEmail: { type: String, required: true },
  gymWebsite: String,
  Availability: String,
  Price: Int32Array,
  Description: String,
  Speciality: String,
  Age: Int32Array,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Trainer", trainerSchema);

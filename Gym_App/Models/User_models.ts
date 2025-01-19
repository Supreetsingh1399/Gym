import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: Int32Array, required: true },
  status: { type: String, default: "approved" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);

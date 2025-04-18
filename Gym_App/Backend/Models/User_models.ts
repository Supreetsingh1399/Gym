import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  name: { type: String, required: true },
  fitnessGoal: { type: String, required: true },
  gender: { type: String, required: true },
  age: {
    type: Number,
    required: true,
    validate: {
      validator: function (v: number) {
        return v > 0 && v < 120;
      },
      message: "Age must be a positive number less than 120",
    },
  },
  weight: {
    type: String,
    required: true,
      message: "Weight must be in kg",
    },
  height: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return /^\d+(\.\d+)?(cm|m)$/.test(v);
      },
      message: "Height must be in cm",
    },
    // Example: 180cm or 1.8m
    // where cm is centimeters and m is meters
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v: string) {
        return /^\d{10}$/.test(v);
      },
      message: "Phone number must be 10 digits",
    },
  },
  status: { type: String, default: "approved" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);

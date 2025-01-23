import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: {
    type: String,
    required: true,
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

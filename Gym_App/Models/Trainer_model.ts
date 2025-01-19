import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\d{10}$/.test(v);
      },
      message: 'Phone number must be 10 digits'
    }
  },
  gymName: { type: String, required: true },
  gymAddress: { type: String, required: true },
  gymCity: { type: String, required: true },
  gymPhone: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\d{10}$/.test(v);
      },
      message: 'Gym phone number must be 10 digits'
    }
  },
  gymEmail: { type: String, required: true },
  gymWebsite: String,
  Availability: String,
  Price: { type: Number, default: 0 },
  Description: String,
  Speciality: String,
  Age: { type: Number, min: 18 },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Trainer", trainerSchema);
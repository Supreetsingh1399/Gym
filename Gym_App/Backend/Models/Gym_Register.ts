import mongoose from "mongoose";

const gymSchema = new mongoose.Schema({
  gymName: { type: String, required: true },
  ownerName: { type: String, required: true },
  contactNumber: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => /^\d{10}$/.test(v),
      message: "Phone number must be 10 digits",
    },
  },
  email: { type: String, required: true, unique: true },
  businessRegistrationNumber: String,
  website: String,

  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    latitude: Number,
    longitude: Number,
    placeId: String,
  },

  facilities: {
    gymType: { type: String, required: true },
    equipment: [String],
    specialFeatures: [String],
    operatingHours: {
      weekdays: { type: String, required: true },
      weekends: { type: String, required: true },
    },
    parkingAvailable: { type: Boolean, default: false },
  },

  pricing: {
    membershipPlans: [
      {
        planName: { type: String, required: true },
        price: { type: Number, required: true },
        duration: { type: String, required: true },
      },
    ],
    personalTraining: {
      available: { type: Boolean, default: false },
      cost: Number,
    },
    trialClassAvailable: { type: Boolean, default: false },
  },

  trainers: [
    {
      name: { type: String, required: true },
      specialization: [String],
      certifications: [String],
    },
  ],

  media: {
    logoUrl: String,
    coverImageUrl: String,
    gallery: [String],
  },

  policies: {
    cancellationPolicy: String,
    liabilityWaiver: String,
    termsOfService: String,
  },

  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Gym", gymSchema);

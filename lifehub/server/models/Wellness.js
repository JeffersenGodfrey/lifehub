import mongoose from "mongoose";

const wellnessSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    date: { type: Date, required: true }, // date of wellness log
    sleepHours: { type: Number, default: 0 },
    waterIntake: { type: Number, default: 0 }, // in liters
    steps: { type: Number, default: 0 },
    mood: { type: String }, // optional: "Happy", "Neutral", etc.
  },
  { timestamps: true }
);

wellnessSchema.index({ userId: 1, date: 1 }, { unique: true });

const Wellness = mongoose.model("Wellness", wellnessSchema);
export default Wellness;

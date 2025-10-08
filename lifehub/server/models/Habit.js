import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedDates: [{ type: Date }], // Track completion history
  },
  { timestamps: true }
);

export default mongoose.model("Habit", habitSchema);
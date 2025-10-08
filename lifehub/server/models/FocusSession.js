import mongoose from "mongoose";

const focusSessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    date: { type: Date, required: true },
    sessions: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

focusSessionSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("FocusSession", focusSessionSchema);
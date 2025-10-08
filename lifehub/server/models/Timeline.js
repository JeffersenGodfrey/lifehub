import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    time: { type: String, required: true },
    activity: { type: String, required: true },
    icon: { type: String, default: "📝" },
  },
  { timestamps: true }
);

export default mongoose.model("Timeline", timelineSchema);
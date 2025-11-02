import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // user identifier (Firebase UID or your own)
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    category: { type: String },
    lastNotified: { type: Date }, // Last time overdue notification was sent
    reminderSent: { type: Boolean, default: false }, // Whether 24h reminder was sent
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;

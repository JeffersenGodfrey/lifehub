import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    category: { type: String },
    lastNotified: { type: Date },
    notificationCount: { type: Number, default: 0 },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;

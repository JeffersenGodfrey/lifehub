import Task from "../models/Task.js";

// Get all tasks for a user
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }); // req.userId comes from auth
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const newTask = new Task({ ...req.body, userId: req.userId });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update a task by ID
export const updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete a task by ID
export const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

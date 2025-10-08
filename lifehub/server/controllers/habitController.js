import Habit from "../models/Habit.js";

export const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const createHabit = async (req, res) => {
  try {
    const newHabit = new Habit({ ...req.body, userId: req.userId });
    const savedHabit = await newHabit.save();
    res.status(201).json(savedHabit);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const updatedHabit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!updatedHabit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    res.json(updatedHabit);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const deletedHabit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deletedHabit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    res.json({ message: "Habit deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
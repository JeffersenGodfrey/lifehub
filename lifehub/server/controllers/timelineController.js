import Timeline from "../models/Timeline.js";

export const getTimeline = async (req, res) => {
  try {
    const timeline = await Timeline.find({ userId: req.userId }).sort({ time: 1 });
    res.json(timeline);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const createTimelineItem = async (req, res) => {
  try {
    const newItem = new Timeline({ ...req.body, userId: req.userId });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateTimelineItem = async (req, res) => {
  try {
    const updatedItem = await Timeline.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: "Timeline item not found" });
    }
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteTimelineItem = async (req, res) => {
  try {
    const deletedItem = await Timeline.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deletedItem) {
      return res.status(404).json({ message: "Timeline item not found" });
    }
    res.json({ message: "Timeline item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
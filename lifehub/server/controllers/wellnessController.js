import Wellness from "../models/Wellness.js";

// Get all wellness logs for a user
export const getWellnessLogs = async (req, res) => {
  try {
    const logs = await Wellness.find({ userId: req.userId }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create or update wellness log for a specific date
export const createWellnessLog = async (req, res) => {
  try {
    const { date, ...logData } = req.body;
    
    // Find existing log for this date and user, or create new one
    const savedLog = await Wellness.findOneAndUpdate(
      { userId: req.userId, date: date },
      { ...logData, userId: req.userId, date: date },
      { new: true, upsert: true }
    );
    
    res.status(201).json(savedLog);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update a wellness log by ID
export const updateWellnessLog = async (req, res) => {
  try {
    const updatedLog = await Wellness.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedLog);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete a wellness log by ID
export const deleteWellnessLog = async (req, res) => {
  try {
    await Wellness.findByIdAndDelete(req.params.id);
    res.json({ message: "Wellness log deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Clean up duplicate wellness logs for a user
export const cleanupDuplicateLogs = async (req, res) => {
  try {
    const logs = await Wellness.find({ userId: req.userId }).sort({ date: 1, createdAt: -1 });
    const seenDates = new Set();
    const duplicates = [];
    
    logs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0];
      if (seenDates.has(dateKey)) {
        duplicates.push(log._id);
      } else {
        seenDates.add(dateKey);
      }
    });
    
    if (duplicates.length > 0) {
      await Wellness.deleteMany({ _id: { $in: duplicates } });
    }
    
    res.json({ message: `Cleaned up ${duplicates.length} duplicate logs` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

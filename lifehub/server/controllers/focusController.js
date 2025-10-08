import FocusSession from "../models/FocusSession.js";

export const getFocusStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = await FocusSession.findOne({ userId: req.userId, date: today });
    res.json(stats || { sessions: 0, totalMinutes: 0 });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateFocusStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { sessions, totalMinutes } = req.body;
    
    const stats = await FocusSession.findOneAndUpdate(
      { userId: req.userId, date: today },
      { sessions, totalMinutes },
      { new: true, upsert: true }
    );
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
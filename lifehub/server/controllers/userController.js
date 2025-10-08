import User from "../models/User.js";

// Create or update user profile
export const createOrUpdateUser = async (req, res) => {
  try {
    const { email, displayName } = req.body;
    const firebaseUid = req.userId;

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { 
        email, 
        displayName: displayName || email.split('@')[0],
        lastLogin: new Date()
      },
      { new: true, upsert: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update notification preferences
export const updateNotificationSettings = async (req, res) => {
  try {
    const { notificationsEnabled } = req.body;
    const user = await User.findOneAndUpdate(
      { firebaseUid: req.userId },
      { notificationsEnabled },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
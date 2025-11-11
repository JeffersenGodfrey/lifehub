import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendOverdueTaskEmail } from '../services/emailService.js';

const router = express.Router();

// Test overdue task detection
router.get('/overdue-check', async (req, res) => {
  try {
    const now = new Date();
    
    // Get all tasks
    const allTasks = await Task.find({});
    const incompleteTasks = await Task.find({ completed: false });
    
    // Find overdue tasks
    const overdueTasks = await Task.find({
      completed: false,
      dueDate: { $lt: now }
    });
    
    // Get all users
    const allUsers = await User.find({});
    
    const result = {
      currentTime: now.toISOString(),
      totalTasks: allTasks.length,
      incompleteTasks: incompleteTasks.length,
      overdueTasks: overdueTasks.length,
      totalUsers: allUsers.length,
      tasks: overdueTasks.map(task => ({
        title: task.title,
        dueDate: task.dueDate,
        userId: task.userId
      })),
      users: allUsers.map(user => ({
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName
      }))
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
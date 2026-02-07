import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendOverdueTaskEmail } from '../services/emailService.js';

const router = express.Router();

// Test overdue task detection
router.get('/check', async (req, res) => {
  try {
    const now = new Date();
    const allTasks = await Task.find({});
    const allUsers = await User.find({});
    const overdueTasks = await Task.find({
      completed: false,
      dueDate: { $lt: now }
    });
    
    res.json({
      currentTime: now.toISOString(),
      totalTasks: allTasks.length,
      totalUsers: allUsers.length,
      overdueTasks: overdueTasks.length,
      users: allUsers.map(u => ({ uid: u.firebaseUid, email: u.email, notifications: u.notificationsEnabled })),
      tasks: overdueTasks.map(t => ({ title: t.title, due: t.dueDate, user: t.userId }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test email sending
router.post('/email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email required in body' });
    }
    
    const testTasks = [{
      title: 'Test Task from LifeHub',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }];
    
    console.log(`🧪 Testing email to: ${email}`);
    const result = await sendOverdueTaskEmail(email, testTasks);
    res.json({ success: result.success, message: 'Check email and server logs', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
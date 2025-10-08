import cron from 'node-cron';
import Task from '../models/Task.js';
import Wellness from '../models/Wellness.js';
import User from '../models/User.js';
import { sendTaskReminder, sendWellnessReminder } from './emailService.js';

// Check for overdue tasks daily at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Checking for overdue tasks...');
  
  try {
    const today = new Date();
    const overdueTasks = await Task.find({
      dueDate: { $lt: today },
      completed: false
    }).populate('userId');

    // Group tasks by user
    const tasksByUser = {};
    overdueTasks.forEach(task => {
      const userId = task.userId;
      if (!tasksByUser[userId]) {
        tasksByUser[userId] = [];
      }
      tasksByUser[userId].push(task);
    });

    // Send reminders to each user
    for (const [userId, tasks] of Object.entries(tasksByUser)) {
      const user = await User.findOne({ firebaseUid: userId });
      if (user && user.notificationsEnabled) {
        await sendTaskReminder(user.email, user.displayName, tasks);
      }
    }
  } catch (error) {
    console.error('Error checking overdue tasks:', error);
  }
});

// Check for missed wellness goals daily at 8 PM
cron.schedule('0 20 * * *', async () => {
  console.log('Checking for missed wellness goals...');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const users = await Wellness.distinct('userId');
    
    for (const userId of users) {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user || !user.notificationsEnabled) continue;
      
      const todayLog = await Wellness.findOne({ userId, date: today });
      
      if (!todayLog) {
        const missedGoals = ['Water intake', 'Sleep tracking', 'Mood check-in', 'Steps count'];
        await sendWellnessReminder(user.email, user.displayName, missedGoals);
      } else {
        const missedGoals = [];
        if (!todayLog.waterIntake || todayLog.waterIntake < 8) missedGoals.push('Water goal');
        if (!todayLog.sleepHours || todayLog.sleepHours < 7) missedGoals.push('Sleep goal');
        if (!todayLog.steps || todayLog.steps < 10000) missedGoals.push('Steps goal');
        
        if (missedGoals.length > 0) {
          await sendWellnessReminder(user.email, user.displayName, missedGoals);
        }
      }
    }
  } catch (error) {
    console.error('Error checking wellness goals:', error);
  }
});

export const startNotificationScheduler = () => {
  console.log('📧 Notification scheduler started');
};
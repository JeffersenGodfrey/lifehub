import cron from 'node-cron';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendOverdueTaskEmail, sendTaskReminderEmail } from './emailService.js';

// Check for overdue tasks every hour
export const startOverdueTaskChecker = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      
      const overdueTasks = await Task.find({
        completed: false,
        dueDate: { $lt: now },
        $or: [
          { lastNotified: { $exists: false } },
          { lastNotified: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
        ]
      });

      if (overdueTasks.length > 0) {
        const tasksByUser = {};
        overdueTasks.forEach(task => {
          if (!tasksByUser[task.userId]) {
            tasksByUser[task.userId] = [];
          }
          tasksByUser[task.userId].push(task);
        });

        for (const [userId, userTasks] of Object.entries(tasksByUser)) {
          try {
            const user = await User.findOne({ firebaseUid: userId });
            
            if (!user || !user.email || user.notificationsEnabled === false) {
              continue;
            }
            
            await sendOverdueTaskEmail(user.email, userTasks);
            
            await Task.updateMany(
              { _id: { $in: userTasks.map(t => t._id) } },
              { lastNotified: now }
            );
          } catch (error) {
            console.error(`Failed to send notification to user ${userId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in overdue task checker:', error);
    }
  });
  
  console.log('⏰ Overdue task checker started (runs every hour)');
};

// Check for tasks due in 24 hours (reminder)
export const startTaskReminderChecker = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const upcomingTasks = await Task.find({
        completed: false,
        dueDate: { 
          $gte: now,
          $lte: in24Hours 
        },
        reminderSent: { $ne: true }
      });

      if (upcomingTasks.length > 0) {
        for (const task of upcomingTasks) {
          try {
            const user = await User.findOne({ firebaseUid: task.userId });
            if (!user || !user.email || !user.notificationsEnabled) {
              continue;
            }
            
            const hoursUntilDue = Math.round((new Date(task.dueDate) - now) / (1000 * 60 * 60));
            
            await sendTaskReminderEmail(user.email, task, hoursUntilDue);
            
            await Task.findByIdAndUpdate(task._id, { reminderSent: true });
          } catch (error) {
            console.error(`Failed to send reminder for task ${task._id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in task reminder checker:', error);
    }
  });
  
  console.log('🔔 Task reminder checker started (runs daily at 9 AM)');
};
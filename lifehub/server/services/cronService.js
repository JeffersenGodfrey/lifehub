import cron from 'node-cron';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendOverdueTaskEmail, sendTaskReminderEmail } from './emailService.js';

export const startOverdueTaskChecker = () => {
  cron.schedule('0 9,17 * * *', async () => {
    try {
      const now = new Date();
      console.log('🔍 Checking overdue tasks at', now.toISOString());
      
      const overdueTasks = await Task.find({
        completed: false,
        dueDate: { $lt: now },
        $or: [
          { lastNotified: { $exists: false } },
          { lastNotified: { $lt: new Date(now.getTime() - 12 * 60 * 60 * 1000) } }
        ]
      });
      
      console.log(`⚠️ Found ${overdueTasks.length} overdue tasks`);

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
              console.log(`⏭️ Skipping user ${userId}`);
              continue;
            }
            
            console.log(`📧 Sending email to ${user.email} for ${userTasks.length} tasks`);
            await sendOverdueTaskEmail(user.email, userTasks);
            
            await Task.updateMany(
              { _id: { $in: userTasks.map(t => t._id) } },
              { lastNotified: now }
            );
            
            console.log(`✅ Email sent and tasks updated`);
          } catch (error) {
            console.error(`❌ Failed for user ${userId}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in overdue checker:', error.message);
    }
  });
  
  console.log('⏰ Overdue task checker started (runs at 9 AM and 5 PM daily)');
};

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
            console.error(`❌ Failed reminder for task ${task._id}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in reminder checker:', error.message);
    }
  });
  
  console.log('🔔 Task reminder checker started (runs daily at 9 AM)');
};
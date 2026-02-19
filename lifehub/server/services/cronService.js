import cron from 'node-cron';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendOverdueTaskEmail, sendTaskReminderEmail } from './emailService.js';

const getNotificationSchedule = (dueDate, notificationCount) => {
  const now = new Date();
  const daysSinceOverdue = Math.floor((now - new Date(dueDate)) / (1000 * 60 * 60 * 24));
  
  // Notification schedule:
  // 1st: When task becomes overdue (day 0)
  // 2nd: After 1 day (day 1)
  // 3rd: After 1 week (day 7)
  // 4th: After 1 month (day 30)
  
  if (notificationCount === 0 && daysSinceOverdue >= 0) return true; // First notification
  if (notificationCount === 1 && daysSinceOverdue >= 1) return true; // After 1 day
  if (notificationCount === 2 && daysSinceOverdue >= 7) return true; // After 1 week
  if (notificationCount === 3 && daysSinceOverdue >= 30) return true; // After 1 month
  
  return false;
};

export const startOverdueTaskChecker = () => {
  // Check every hour for newly overdue tasks
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      console.log('🔍 Checking for newly overdue tasks at', now.toISOString());
      
      // Find tasks that became overdue in the last hour and haven't been notified
      const newlyOverdueTasks = await Task.find({
        completed: false,
        dueDate: { 
          $exists: true, 
          $ne: null, 
          $gte: oneHourAgo,
          $lt: now 
        },
        notificationCount: 0
      });
      
      console.log(`⚠️ Found ${newlyOverdueTasks.length} newly overdue tasks`);

      if (newlyOverdueTasks.length > 0) {
        const tasksByUser = {};
        
        for (const task of newlyOverdueTasks) {
          if (!tasksByUser[task.userId]) {
            tasksByUser[task.userId] = [];
          }
          tasksByUser[task.userId].push(task);
        }

        for (const [userId, userTasks] of Object.entries(tasksByUser)) {
          try {
            const user = await User.findOne({ firebaseUid: userId });
            
            if (!user || !user.email || user.notificationsEnabled === false) {
              console.log(`⏭️ Skipping user ${userId} - notifications disabled or no email`);
              continue;
            }
            
            console.log(`📧 Sending IMMEDIATE overdue email to ${user.email} for ${userTasks.length} tasks`);
            const result = await sendOverdueTaskEmail(user.email, userTasks);
            
            if (result.success) {
              for (const task of userTasks) {
                await Task.findByIdAndUpdate(task._id, {
                  lastNotified: now,
                  notificationCount: 1
                });
              }
              console.log(`✅ Immediate email sent to ${user.email}`);
            } else {
              console.error(`❌ Email failed for ${user.email}:`, result.error);
            }
          } catch (error) {
            console.error(`❌ Failed for user ${userId}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in overdue checker:', error.message);
    }
  });
  
  console.log('⏰ Overdue task checker started (checks every hour for newly overdue tasks)');
};

export const startTaskReminderChecker = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      console.log('🔔 Checking upcoming tasks at', now.toISOString());
      
      const upcomingTasks = await Task.find({
        completed: false,
        dueDate: { 
          $exists: true,
          $ne: null,
          $gte: now,
          $lte: in24Hours 
        },
        reminderSent: { $ne: true }
      });

      console.log(`📅 Found ${upcomingTasks.length} upcoming tasks`);

      if (upcomingTasks.length > 0) {
        for (const task of upcomingTasks) {
          try {
            const user = await User.findOne({ firebaseUid: task.userId });
            if (!user || !user.email || user.notificationsEnabled === false) {
              console.log(`⏭️ Skipping task ${task._id} - user notifications disabled`);
              continue;
            }
            
            const hoursUntilDue = Math.round((new Date(task.dueDate) - now) / (1000 * 60 * 60));
            
            console.log(`📧 Sending reminder to ${user.email} for task: ${task.title}`);
            const result = await sendTaskReminderEmail(user.email, task, hoursUntilDue);
            
            if (result.success) {
              await Task.findByIdAndUpdate(task._id, { reminderSent: true });
              console.log(`✅ Reminder sent for task ${task._id}`);
            } else {
              console.error(`❌ Reminder failed for task ${task._id}:`, result.error);
            }
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
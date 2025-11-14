import cron from 'node-cron';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendOverdueTaskEmail, sendTaskReminderEmail } from './emailService.js';

// Check for overdue tasks every hour
export const startOverdueTaskChecker = () => {
  cron.schedule('*/5 * * * *', async () => { // Every 5 minutes for testing
    console.log('🔍 Checking for overdue tasks...');
    try {
      const now = new Date();
      
      // Debug: Check total counts
      const totalTasks = await Task.countDocuments();
      const totalUsers = await User.countDocuments();
      console.log(`📊 Database: ${totalTasks} tasks, ${totalUsers} users`);
      
      const overdueTasks = await Task.find({
        completed: false,
        dueDate: { $lt: now },
        $or: [
          { lastNotified: { $exists: false } },
          { lastNotified: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
        ]
      });
      
      console.log(`⚠️ Found ${overdueTasks.length} overdue tasks`);
      
      // Debug: Show all incomplete tasks with their due dates
      const allIncompleteTasks = await Task.find({ completed: false });
      console.log('📋 All incomplete tasks:');
      allIncompleteTasks.forEach(task => {
        const isOverdue = task.dueDate && new Date(task.dueDate) < now;
        console.log(`  - "${task.title}" due: ${task.dueDate} (${isOverdue ? 'OVERDUE' : 'not overdue'}) lastNotified: ${task.lastNotified || 'never'}`);
      });

      if (overdueTasks.length > 0) {
        console.log('📧 Processing overdue tasks for email notifications...');
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
import cron from 'node-cron';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendOverdueTaskEmail, sendTaskReminderEmail } from './emailService.js';

// Check for overdue tasks every 5 minutes
export const startOverdueTaskChecker = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      console.log('🔍 Checking for overdue tasks at', now.toISOString());
      
      const totalTasks = await Task.countDocuments();
      const totalUsers = await User.countDocuments();
      console.log(`📊 Database: ${totalTasks} tasks, ${totalUsers} users`);
      
      // Get all incomplete tasks first
      const allIncompleteTasks = await Task.find({ completed: false });
      console.log(`📋 Found ${allIncompleteTasks.length} incomplete tasks`);
      
      // Show each task details
      for (let i = 0; i < allIncompleteTasks.length; i++) {
        const task = allIncompleteTasks[i];
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < now;
        console.log(`${i + 1}. "${task.title}" - Due: ${task.dueDate} - Overdue: ${isOverdue} - LastNotified: ${task.lastNotified || 'never'}`);
      }
      
      // Find overdue tasks with the query
      const overdueTasks = await Task.find({
        completed: false,
        dueDate: { $lt: now },
        $or: [
          { lastNotified: { $exists: false } },
          { lastNotified: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
        ]
      });
      
      console.log(`⚠️ Found ${overdueTasks.length} overdue tasks matching query`);

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
            console.log(`👤 User lookup for ${userId}:`, user ? `${user.email} (notifications: ${user.notificationsEnabled})` : 'not found');
            
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
            console.error(`❌ Failed to send notification to user ${userId}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in overdue task checker:', error.message);
    }
  });
  
  console.log('⏰ Overdue task checker started (runs every 5 minutes) - v2.0');
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
            console.error(`Failed to send reminder for task ${task._id}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('Error in task reminder checker:', error.message);
    }
  });
  
  console.log('🔔 Task reminder checker started (runs daily at 9 AM)');
};
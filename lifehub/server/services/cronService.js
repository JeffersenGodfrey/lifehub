import cron from 'node-cron';
import Task from '../models/Task.js';
import { sendOverdueTaskEmail, sendTaskReminderEmail } from './emailService.js';

// Check for overdue tasks every hour
export const startOverdueTaskChecker = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('🔍 Checking for overdue tasks...');
    
    try {
      const now = new Date();
      
      // Find overdue tasks (not completed, past due date)
      const overdueTasks = await Task.find({
        completed: false,
        dueDate: { $lt: now },
        $or: [
          { lastNotified: { $exists: false } },
          { lastNotified: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
        ]
      });

      if (overdueTasks.length > 0) {
        console.log(`📧 Found ${overdueTasks.length} overdue tasks to notify`);
        
        // Group tasks by user
        const tasksByUser = {};
        overdueTasks.forEach(task => {
          if (!tasksByUser[task.userId]) {
            tasksByUser[task.userId] = [];
          }
          tasksByUser[task.userId].push(task);
        });

        // Send emails to each user
        for (const [userId, userTasks] of Object.entries(tasksByUser)) {
          try {
            // For now, we'll use a placeholder email. In production, you'd fetch user email from user profile
            const userEmail = `${userId}@example.com`; // Replace with actual user email lookup
            
            await sendOverdueTaskEmail(userEmail, userTasks);
            
            // Update lastNotified timestamp
            await Task.updateMany(
              { _id: { $in: userTasks.map(t => t._id) } },
              { lastNotified: now }
            );
            
            console.log(`✅ Sent overdue notification to ${userEmail}`);
          } catch (error) {
            console.error(`❌ Failed to send notification to user ${userId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in overdue task checker:', error);
    }
  });
  
  console.log('⏰ Overdue task checker started (runs every hour)');
};

// Check for tasks due in 24 hours (reminder)
export const startTaskReminderChecker = () => {
  cron.schedule('0 9 * * *', async () => { // Run daily at 9 AM
    console.log('🔔 Checking for tasks due in 24 hours...');
    
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      // Find tasks due in next 24 hours
      const upcomingTasks = await Task.find({
        completed: false,
        dueDate: { 
          $gte: now,
          $lte: in24Hours 
        },
        reminderSent: { $ne: true }
      });

      if (upcomingTasks.length > 0) {
        console.log(`📧 Found ${upcomingTasks.length} tasks due in 24 hours`);
        
        for (const task of upcomingTasks) {
          try {
            const userEmail = `${task.userId}@example.com`; // Replace with actual user email lookup
            const hoursUntilDue = Math.round((new Date(task.dueDate) - now) / (1000 * 60 * 60));
            
            await sendTaskReminderEmail(userEmail, task, hoursUntilDue);
            
            // Mark reminder as sent
            await Task.findByIdAndUpdate(task._id, { reminderSent: true });
            
            console.log(`✅ Sent reminder for task: ${task.title}`);
          } catch (error) {
            console.error(`❌ Failed to send reminder for task ${task._id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in task reminder checker:', error);
    }
  });
  
  console.log('🔔 Task reminder checker started (runs daily at 9 AM)');
};
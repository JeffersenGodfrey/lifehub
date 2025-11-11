import cron from 'node-cron';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendOverdueTaskEmail, sendTaskReminderEmail } from './emailService.js';

// Check for overdue tasks every hour
export const startOverdueTaskChecker = () => {
  // Run once immediately for testing
  console.log('🚀 Running immediate overdue task check...');
  checkOverdueTasks();
  
  cron.schedule('*/5 * * * *', async () => { // Every 5 minutes for testing
    await checkOverdueTasks();
  });
  
  console.log('⏰ Overdue task checker started (runs every 5 minutes)');
};

const checkOverdueTasks = async () => {
  console.log('🔍 Checking for overdue tasks...');
    
    try {
      const now = new Date();
      console.log('⏰ Current time:', now.toISOString());
      
      // First, check all tasks
      const allTasks = await Task.find({});
      console.log(`📋 Total tasks in database: ${allTasks.length}`);
      
      const incompleteTasks = await Task.find({ completed: false });
      console.log(`📝 Incomplete tasks: ${incompleteTasks.length}`);
      
      // Find overdue tasks (not completed, past due date)
      const overdueTasks = await Task.find({
        completed: false,
        dueDate: { $lt: now },
        $or: [
          { lastNotified: { $exists: false } },
          { lastNotified: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
        ]
      });
      
      console.log(`⚠️ Found ${overdueTasks.length} overdue tasks`);
      if (overdueTasks.length > 0) {
        overdueTasks.forEach(task => {
          console.log(`  - ${task.title} (Due: ${task.dueDate}, User: ${task.userId})`);
        });
      }

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
            // Fetch real user email from database
            const user = await User.findOne({ firebaseUid: userId });
            console.log(`🔍 User lookup for ${userId}:`, user ? { email: user.email, notificationsEnabled: user.notificationsEnabled } : 'User not found');
            
            if (!user || !user.email || user.notificationsEnabled === false) {
              console.log(`⏭️ Skipping user ${userId} - no email or notifications disabled`);
              continue;
            }
            
            console.log(`📧 Attempting to send email to: ${user.email}`);
            await sendOverdueTaskEmail(user.email, userTasks);
            
            // Update lastNotified timestamp
            await Task.updateMany(
              { _id: { $in: userTasks.map(t => t._id) } },
              { lastNotified: now }
            );
            
            console.log(`✅ Sent overdue notification to ${user.email}`);
          } catch (error) {
            console.error(`❌ Failed to send notification to user ${userId}:`, error);
          }
        }
      }
  } catch (error) {
    console.error('❌ Error in overdue task checker:', error);
  }
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
            // Fetch real user email from database
            const user = await User.findOne({ firebaseUid: task.userId });
            if (!user || !user.email || !user.notificationsEnabled) {
              console.log(`⏭️ Skipping reminder for user ${task.userId} - no email or notifications disabled`);
              continue;
            }
            
            const hoursUntilDue = Math.round((new Date(task.dueDate) - now) / (1000 * 60 * 60));
            
            await sendTaskReminderEmail(user.email, task, hoursUntilDue);
            
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
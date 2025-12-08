import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter using Gmail with SSL
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

export const sendOverdueTaskEmail = async (userEmail, overdueTasks) => {
  try {
    const taskList = overdueTasks.map(task => 
      `• ${task.title} (Due: ${new Date(task.dueDate).toLocaleString()})`
    ).join('\n');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `⚠️ LifeHub: ${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff4757;">⚠️ Overdue Tasks Alert</h2>
          <p>Hi there!</p>
          <p>You have <strong>${overdueTasks.length}</strong> overdue task${overdueTasks.length > 1 ? 's' : ''} in your LifeHub:</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${overdueTasks.map(task => `
              <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #ff4757;">
                <strong>${task.title}</strong><br>
                <small style="color: #666;">Due: ${new Date(task.dueDate).toLocaleString()}</small>
              </div>
            `).join('')}
          </div>
          
          <p>Don't let these tasks pile up! <a href="${process.env.FRONTEND_URL || 'https://lifehub-task.vercel.app'}" style="color: #4B9DEA;">Open LifeHub</a> to complete them.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated reminder from LifeHub. You can manage your notification preferences in the app.
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Overdue task email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Failed to send overdue task email:', error);
    return { success: false, error: error.message };
  }
};

export const sendTaskReminderEmail = async (userEmail, task, hoursUntilDue) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🔔 LifeHub: Task Due in ${hoursUntilDue} hours`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4B9DEA;">🔔 Task Reminder</h2>
          <p>Hi there!</p>
          <p>Your task is due soon:</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <div style="padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #4B9DEA;">
              <strong>${task.title}</strong><br>
              <small style="color: #666;">Due: ${new Date(task.dueDate).toLocaleString()}</small><br>
              <small style="color: #ffa502;">⏰ ${hoursUntilDue} hours remaining</small>
            </div>
          </div>
          
          <p><a href="${process.env.FRONTEND_URL || 'https://lifehub-task.vercel.app'}" style="color: #4B9DEA;">Open LifeHub</a> to complete this task.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated reminder from LifeHub.
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Task reminder email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Failed to send task reminder email:', error);
    return { success: false, error: error.message };
  }
};
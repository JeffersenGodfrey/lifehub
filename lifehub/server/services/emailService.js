import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'lifehub.notifications@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

export const sendTaskReminder = async (userEmail, userName, overdueTasks) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'lifehub.notifications@gmail.com',
    to: userEmail,
    subject: '⏰ LifeHub: Overdue Tasks Reminder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4B9DEA;">📋 Task Reminder</h2>
        <p>Hi ${userName},</p>
        <p>You have <strong>${overdueTasks.length}</strong> overdue tasks:</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          ${overdueTasks.map(task => `
            <div style="margin: 8px 0; padding: 8px; background: white; border-radius: 4px;">
              <strong>${task.title}</strong><br>
              <small style="color: #666;">Due: ${new Date(task.dueDate).toLocaleDateString()}</small>
            </div>
          `).join('')}
        </div>
        <p><a href="https://lifehub-task.vercel.app" style="color: #4B9DEA;">Complete them now</a></p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Task reminder sent to ${userEmail}`);
  } catch (error) {
    console.error('Failed to send task reminder:', error);
  }
};

export const sendWellnessReminder = async (userEmail, userName, missedGoals) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'lifehub.notifications@gmail.com',
    to: userEmail,
    subject: '💚 LifeHub: Wellness Goals Reminder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6BE585;">💚 Wellness Check-in</h2>
        <p>Hi ${userName},</p>
        <p>Missed goals: ${missedGoals.join(', ')}</p>
        <p><a href="https://lifehub-task.vercel.app" style="color: #6BE585;">Track your wellness now</a></p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Wellness reminder sent to ${userEmail}`);
  } catch (error) {
    console.error('Failed to send wellness reminder:', error);
  }
};
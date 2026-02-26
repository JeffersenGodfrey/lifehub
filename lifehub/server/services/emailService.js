import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

const initializeTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials not configured - email features disabled');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    console.log('📧 Email service initialized successfully');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    return transporter;
  } catch (error) {
    console.error('❌ Email service initialization failed:', error.message);
    return null;
  }
};

transporter = initializeTransporter();

export const sendOverdueTaskEmail = async (userEmail, overdueTasks) => {
  try {
    if (!transporter) {
      console.error('❌ Email service not initialized');
      return { success: false, error: 'Email service not configured' };
    }

    if (!userEmail || !overdueTasks || overdueTasks.length === 0) {
      console.error('❌ Invalid email parameters:', { userEmail, taskCount: overdueTasks?.length });
      return { success: false, error: 'Invalid parameters' };
    }

    console.log('📧 Preparing to send email to:', userEmail);

    const isReminder = overdueTasks.some(t => t.notificationCount > 0);
    const subject = isReminder 
      ? `🔔 LifeHub: Reminder - ${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`
      : `⚠️ LifeHub: ${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`;

    const mailOptions = {
      from: `LifeHub <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff4757;">${isReminder ? '🔔 Task Reminder' : '⚠️ Overdue Tasks Alert'}</h2>
          <p>Hi there!</p>
          <p>${isReminder ? 'Friendly reminder about your' : 'You have'} <strong>${overdueTasks.length}</strong> overdue task${overdueTasks.length > 1 ? 's' : ''} in your LifeHub:</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${overdueTasks.map(task => `
              <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #ff4757;">
                <strong>${task.title}</strong><br>
                <small style="color: #666;">Due: ${new Date(task.dueDate).toLocaleString()}</small>
              </div>
            `).join('')}
          </div>
          
          <p>Don't let these tasks pile up! <a href="${process.env.FRONTEND_URL}" style="color: #4B9DEA;">Open LifeHub</a> to complete them.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated reminder from LifeHub.
          </p>
        </div>
      `
    };

    console.log('📧 Sending email via SMTP...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully! MessageID:', result.messageId);
    console.log('✅ Response:', result.response);
    return { success: true, messageId: result.messageId, response: result.response };
  } catch (error) {
    console.error('❌ Email sending failed!');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Full error:', error);
    return { success: false, error: error.message };
  }
};

export const sendTaskReminderEmail = async (userEmail, task, hoursUntilDue) => {
  try {
    if (!transporter) {
      console.error('❌ Email service not initialized');
      return { success: false, error: 'Email service not configured' };
    }

    if (!userEmail || !task) {
      return { success: false, error: 'Invalid parameters' };
    }

    const mailOptions = {
      from: `LifeHub <${process.env.EMAIL_USER}>`,
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
          
          <p><a href="${process.env.FRONTEND_URL}" style="color: #4B9DEA;">Open LifeHub</a> to complete this task.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated reminder from LifeHub.
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Reminder email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendWellnessReminder = async (userEmail, displayName, missedGoals) => {
  try {
    if (!transporter) {
      console.error('❌ Email service not initialized');
      return { success: false, error: 'Email service not configured' };
    }

    if (!userEmail || !missedGoals || missedGoals.length === 0) {
      return { success: false, error: 'Invalid parameters' };
    }

    const mailOptions = {
      from: `LifeHub <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🏃♂️ LifeHub: Missed Wellness Goals`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ffa502;">🏃♂️ Wellness Reminder</h2>
          <p>Hi ${displayName || ''},</p>
          <p>We noticed you missed the following wellness items today:</p>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${missedGoals.map(g => `
              <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                ${g}
              </div>
            `).join('')}
          </div>

          <p>Open LifeHub to log your progress and stay on track: <a href="${process.env.FRONTEND_URL}" style="color: #4B9DEA;">Open LifeHub</a></p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is an automated reminder from LifeHub.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Wellness email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    return { success: false, error: error.message };
  }
};
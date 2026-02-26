import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

let emailService = null;

const initializeEmailService = () => {
  if (process.env.SENDGRID_API_KEY) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      emailService = 'sendgrid';
      console.log('📧 Email service initialized with SendGrid');
      console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
      return true;
    } catch (error) {
      console.error('❌ SendGrid initialization failed:', error.message);
    }
  }
  
  console.warn('⚠️ Email service not configured');
  console.warn('⚠️ Add SENDGRID_API_KEY to environment variables');
  console.warn('⚠️ Get free API key at: https://sendgrid.com/free/');
  return false;
};

initializeEmailService();

export const sendOverdueTaskEmail = async (userEmail, overdueTasks) => {
  try {
    if (!emailService) {
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

    const htmlContent = `
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
    `;

    console.log('📧 Sending email via SendGrid...');
    
    const msg = {
      to: userEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@lifehub.app',
      subject: subject,
      html: htmlContent
    };

    const result = await sgMail.send(msg);
    console.log('✅ Email sent successfully!');
    console.log('✅ Response:', result[0].statusCode);
    return { success: true, messageId: result[0].headers['x-message-id'] };
  } catch (error) {
    console.error('❌ Email sending failed!');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    if (error.response) {
      console.error('❌ Response body:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};

export const sendTaskReminderEmail = async (userEmail, task, hoursUntilDue) => {
  try {
    if (!emailService) {
      return { success: false, error: 'Email service not configured' };
    }

    const msg = {
      to: userEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@lifehub.app',
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
        </div>
      `
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendWellnessReminder = async (userEmail, displayName, missedGoals) => {
  try {
    if (!emailService) {
      return { success: false, error: 'Email service not configured' };
    }

    const msg = {
      to: userEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@lifehub.app',
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
          <p>Open LifeHub to log your progress: <a href="${process.env.FRONTEND_URL}" style="color: #4B9DEA;">Open LifeHub</a></p>
        </div>
      `
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    return { success: false, error: error.message };
  }
};

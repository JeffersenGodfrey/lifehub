# Email Notification Setup

## Current Configuration
- Email: jehackacloud@gmail.com
- App Password: erjbqqruzabtpxev

## Testing Email

### 1. Start Server
```bash
cd lifehub/server
npm start
```

Look for these messages:
- ✅ MongoDB Connected
- ✅ Email server ready
- ⏰ Overdue task checker started (runs every 5 minutes)
- 🔔 Task reminder checker started (runs daily at 9 AM)

### 2. Test Email Manually
```bash
curl -X POST http://localhost:5000/api/test/email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"your-email@example.com\"}"
```

Or use Postman/Thunder Client:
- Method: POST
- URL: http://localhost:5000/api/test/email
- Body (JSON): { "email": "your-email@example.com" }

### 3. Check System Status
```bash
curl http://localhost:5000/api/test/check
```

## Troubleshooting

### If email doesn't work:

1. **Check Gmail App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Generate new 16-character app password
   - Update EMAIL_PASS in .env

2. **Enable 2-Factor Authentication**
   - Required for app passwords
   - Go to: https://myaccount.google.com/security

3. **Check Server Logs**
   - Look for "❌ Email config failed" errors
   - Check for authentication errors

4. **Test with Different Email**
   - Try sending to a different email address
   - Check spam folder

## How It Works

1. **Cron Job** runs every 5 minutes
2. Finds tasks with `dueDate < now` and `completed = false`
3. Groups tasks by user
4. Checks if user has `notificationsEnabled = true`
5. Sends email to user's email address
6. Updates `lastNotified` timestamp on tasks

## Manual Trigger

To manually trigger email for a specific user:
1. Create overdue task in database
2. Ensure user has `notificationsEnabled: true`
3. Wait for next cron cycle (max 5 minutes)
4. Or restart server to trigger immediately

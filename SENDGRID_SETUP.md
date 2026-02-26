# SendGrid Setup Instructions

## Why SendGrid?
Render blocks SMTP ports (465, 587). SendGrid uses HTTP API which works on all platforms.

## Setup Steps:

### 1. Get SendGrid API Key (FREE - 100 emails/day)
1. Go to: https://sendgrid.com/free/
2. Sign up for free account
3. Verify your email
4. Go to: Settings → API Keys
5. Click "Create API Key"
6. Name: "LifeHub"
7. Permissions: "Full Access"
8. Copy the API key (starts with "SG.")

### 2. Verify Sender Email
1. Go to: Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in your email (jeffersengodfrey@gmail.com)
4. Check your email and click verification link

### 3. Add to Render Environment Variables
1. Go to Render Dashboard → Your Service
2. Environment → Add Environment Variable
3. Add:
   - Key: `SENDGRID_API_KEY`
   - Value: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. Add:
   - Key: `SENDGRID_FROM_EMAIL`
   - Value: `jeffersengodfrey@gmail.com` (must match verified sender)
5. Click "Save Changes"
6. Render will auto-redeploy

### 4. Local Development (.env)
Add to `lifehub/server/.env`:
```
SENDGRID_API_KEY=SG.your-api-key-here
SENDGRID_FROM_EMAIL=jeffersengodfrey@gmail.com
```

## Verification
After deployment, check Render logs for:
```
📧 Email service initialized with SendGrid
SENDGRID_API_KEY exists: true
```

Then when task becomes overdue:
```
📧 Sending email via SendGrid...
✅ Email sent successfully!
✅ Response: 202
```

## No More ETIMEDOUT!
SendGrid uses HTTP API, not SMTP, so it works on Render.

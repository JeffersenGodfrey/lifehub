# LifeHub - Secure Setup Guide

## ✅ Security Status
- `.env` files are properly ignored by git
- Credentials are stored locally only
- Email notifications configured and working

## 🔐 Required Credentials

### 1. MongoDB Atlas
```
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DATABASE?retryWrites=true&w=majority
```
Get from: https://cloud.mongodb.com/

### 2. Gmail App Password (for email notifications)
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=16-character-app-password
```
Setup:
1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Other (Custom name)"
4. Copy the 16-character password

### 3. JWT Secret (for authentication)
```
JWT_SECRET=your-secure-random-string
```
Generate with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Firebase (for frontend authentication)
Get from: https://console.firebase.google.com/
- Project Settings → General → Your apps → SDK setup and configuration

## 📝 Setup Instructions

### Local Development:

1. **Server (.env)**
   - File: `lifehub/server/.env`
   - Copy from: `lifehub/server/.env.example`
   - Fill in your actual credentials

2. **Client (.env)**
   - File: `lifehub/client/.env`
   - Copy from: `lifehub/client/.env.example`
   - Fill in your Firebase credentials

### Production Deployment:

**Vercel (Frontend):**
1. Go to Project Settings → Environment Variables
2. Add all variables from `lifehub/client/.env`

**Render/Railway (Backend):**
1. Go to Environment → Environment Variables
2. Add all variables from `lifehub/server/.env`

## 🚨 Security Checklist

- [ ] All credentials are in `.env` files (not `.env.example`)
- [ ] `.env` files are listed in `.gitignore`
- [ ] Run `git status` - `.env` files should NOT appear
- [ ] Never commit `.env` files
- [ ] Use different credentials for development and production
- [ ] Rotate credentials if accidentally exposed

## 📧 Email Features

The app sends automatic emails for:
- Overdue tasks (daily at 9 AM)
- Task reminders (24 hours before due)
- Wellness goal reminders

Email service uses Gmail SMTP with app-specific password.

## 🔍 Verify Setup

```bash
# Check .env files are ignored
git check-ignore -v lifehub/server/.env lifehub/client/.env

# Should show they are ignored by .gitignore
```

## ⚠️ Never Do This

❌ Don't commit `.env` files
❌ Don't share credentials in chat/email
❌ Don't use production credentials in development
❌ Don't hardcode credentials in source files

# Quick Reference - LifeHub Security & Email

## ✅ What's Protected

1. **Git Protection**
   - `.env` files are in `.gitignore`
   - Pre-commit hook blocks accidental commits
   - Only `.env.example` files are tracked

2. **Email Service**
   - Uses Gmail SMTP with app password
   - Sends overdue task notifications (daily 9 AM)
   - Sends 24-hour task reminders (daily 9 AM)
   - Sends wellness goal reminders

## 🧪 Test Your Setup

### 1. Verify .env files are protected:
```bash
cd e:\LifeHub
git status
# .env files should NOT appear in the list
```

### 2. Test email service:
```bash
# Start server
cd lifehub/server
npm start

# In another terminal or Postman:
curl -X POST http://localhost:5000/api/test/email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"your-test-email@gmail.com\"}"
```

### 3. Check server status:
```bash
curl http://localhost:5000/api/test
```

## 📋 Your .env Files

### Server (.env) - Location: `lifehub/server/.env`
```env
MONGO_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
FRONTEND_URL=https://lifehub-ashen.vercel.app
```

### Client (.env) - Location: `lifehub/client/.env`
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Vercel (Frontend):
```bash
cd lifehub/client
vercel --prod
# Add environment variables in Vercel dashboard
```

### Render (Backend):
1. Connect GitHub repo
2. Set build command: `cd lifehub/server && npm install`
3. Set start command: `cd lifehub/server && npm start`
4. Add environment variables from server/.env

## 🔒 Security Checklist

- [x] `.env` files in `.gitignore`
- [x] Pre-commit hook installed
- [x] `.env.example` files have placeholders only
- [ ] Fill in actual credentials in `.env` files
- [ ] Test email service
- [ ] Deploy with environment variables

## 📧 Email Configuration

**Gmail Setup:**
1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to: https://myaccount.google.com/apppasswords
4. Create app password for "Mail"
5. Copy 16-character password to `EMAIL_PASS` in `.env`

**Test Email:**
```bash
POST http://localhost:5000/api/test/email
Body: { "email": "test@example.com" }
```

## ⚠️ If Credentials Leak

1. Immediately rotate all credentials
2. Check git history: `git log --all -- "*/.env"`
3. If found in history, create fresh repo (see MIGRATION_GUIDE.md)
4. Update deployment platforms with new credentials

# URGENT: Security Breach - Credentials Exposed

## Credentials That MUST Be Changed Immediately:

### 1. MongoDB Atlas
- **Current exposed**: `jeffersengodfrey:7jeffersen21formongodb`
- **Action**: Go to MongoDB Atlas → Database Access → Reset password for user `jeffersengodfrey`
- **URL**: https://cloud.mongodb.com/

### 2. Gmail App Password
- **Current exposed**: `jehackacloud@gmail.com` with app password `ctklhvviukvvfyyy`
- **Action**: 
  - Go to Google Account → Security → 2-Step Verification → App passwords
  - Revoke the exposed app password
  - Generate a new 16-character app password
- **URL**: https://myaccount.google.com/apppasswords

### 3. JWT Secret
- **Current exposed**: `lifehub-secret-key-2024`
- **Action**: Generate a new strong secret (see below)

### 4. Firebase API Key
- **Current exposed**: `AIzaSyCgKpP6v0uahwnigtUwExINwywwowSXqp8`
- **Action**: Go to Firebase Console → Project Settings → Restrict API key
- **URL**: https://console.firebase.google.com/

## After Rotating Credentials:

1. Update your local `.env` files with new credentials
2. Update credentials on Vercel/Render deployment platforms
3. Check git history - if `.env` was ever committed, consider the repo compromised
4. Run: `git log --all --full-history -- "*/.env"`

## Generate New JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

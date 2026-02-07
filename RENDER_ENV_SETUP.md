# Render Environment Variables Setup

## Required Environment Variables on Render:

Go to your Render dashboard → Your service → Environment

Add these variables:

1. **MONGO_URI**
   ```
   mongodb+srv://jeffersengodfrey:jeffersen21@lifehub0.lbzhfre.mongodb.net/
   ```

2. **PORT**
   ```
   5000
   ```

3. **JWT_SECRET**
   ```
   lifehub-secret-key-2024
   ```

4. **EMAIL_USER**
   ```
   jehackacloud@gmail.com
   ```

5. **EMAIL_PASS**
   ```
   erjbqqruzabtpxev
   ```

6. **FRONTEND_URL**
   ```
   https://lifehub-ashen.vercel.app
   ```

## Important:
- Make sure EMAIL_USER and EMAIL_PASS are set correctly
- The app password must be valid (16 characters from Google)
- After adding variables, redeploy the service

## To Generate New Gmail App Password:
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "LifeHub"
4. Copy the 16-character password
5. Update EMAIL_PASS on Render

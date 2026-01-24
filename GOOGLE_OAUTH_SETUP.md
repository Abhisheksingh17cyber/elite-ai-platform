# 🔐 Google OAuth Setup Guide for Elite AI-Architect Platform

## Overview
This guide will help you set up Google OAuth authentication so candidates can login with either:
- **Email** (existing method)
- **Google Sign-In** (new OAuth method)

Admins will continue using email + password authentication.

---

## 📋 Prerequisites
1. Google account
2. Access to [Google Cloud Console](https://console.cloud.google.com/)
3. Your application running locally or deployed

---

## 🚀 Google OAuth Setup Steps

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"NEW PROJECT"**
3. Enter project name: `Elite-AI-Platform` (or your choice)
4. Click **"CREATE"**

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Enable APIs and Services"**
2. Search for **"Google+ API"**
3. Click on it and press **"ENABLE"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (for testing with any Google account)
3. Click **"CREATE"**

**Fill in the required fields:**
- **App name**: `Elite AI-Architect Challenge Platform`
- **User support email**: Your email address
- **Developer contact information**: Your email address
- Click **"SAVE AND CONTINUE"**

**Scopes:**
- Click **"ADD OR REMOVE SCOPES"**
- Add these scopes:
  - `userinfo.email`
  - `userinfo.profile`
  - `openid`
- Click **"UPDATE"** → **"SAVE AND CONTINUE"**

**Test users** (for development):
- Click **"ADD USERS"**
- Add your Gmail accounts that will test the app
- Click **"SAVE AND CONTINUE"**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Choose **"Web application"**

**Configure the client:**
- **Name**: `Elite AI Platform Web Client`
- **Authorized JavaScript origins**: 
  ```
  http://localhost:3000
  ```
- **Authorized redirect URIs**:
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- Click **"CREATE"**

**Save your credentials:**
- You'll see a popup with:
  - **Client ID**: `12345.apps.googleusercontent.com`
  - **Client Secret**: `GOCSPX-abc123...`
- **⚠️ IMPORTANT**: Copy these values immediately!

### Step 5: Update Environment Variables

1. Open `.env.local` in your project root
2. Replace the Google OAuth placeholders:

```env
# Neon Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_SWYytZFmgB48@ep-sweet-unit-ahwph4ah.us-east-1.aws.neon.tech/neondb?sslmode=require

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=elite-ai-platform-secret-key-change-in-production

# Google OAuth - REPLACE THESE WITH YOUR ACTUAL VALUES
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET_HERE
```

### Step 6: Restart Development Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

---

## 🧪 Testing Google OAuth

### Test Candidate Login with Google:

1. Go to `http://localhost:3000`
2. Make sure **"Candidate"** tab is selected
3. Click **"Continue with Google"** button
4. Select your Google account
5. Grant permissions
6. You should be redirected back and logged in automatically

### Test Candidate Login with Email:

1. Go to `http://localhost:3000`
2. Click **"Candidate"** tab
3. Enter email: `test@example.com`
4. Enter name: `Test User`
5. Click **"Start Challenge"**

### Test Admin Login:

1. Go to `http://localhost:3000`
2. Click **"Admin"** tab
3. Email: `abhiisingh240@gmail.com`
4. Password: `admin123`
5. Click **"Sign in as Admin"**

---

## 🌐 Production Deployment (Vercel)

### Additional Setup for Production:

1. **Update OAuth Credentials in Google Cloud:**
   - Add production URLs to **Authorized JavaScript origins**:
     ```
     https://your-app.vercel.app
     ```
   - Add to **Authorized redirect URIs**:
     ```
     https://your-app.vercel.app/api/auth/callback/google
     ```

2. **Update Vercel Environment Variables:**
   ```env
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=generate-a-strong-random-secret-here
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   DATABASE_URL=your-neon-connection-string
   ```

3. **Generate Strong NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

---

## ❗ Troubleshooting

### Issue: "OAuth client was not found" Error

**Solution:**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly in `.env.local`
- Make sure there are no extra spaces or quotes
- Restart the dev server after changing `.env.local`

### Issue: "redirect_uri_mismatch" Error

**Solution:**
- Check that your redirect URI in Google Cloud Console exactly matches:
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- No trailing slashes
- Correct protocol (http vs https)

### Issue: Database Connection Errors

**Symptoms:**
- `ENOTFOUND api.c-3.us-east-1.aws.neon.tech`
- `Connect Timeout Error`

**Solutions:**

1. **Check Network Connectivity:**
   ```bash
   # Test if you can reach Neon
   ping ep-sweet-unit-ahwph4ah.us-east-1.aws.neon.tech
   ```

2. **Firewall/Antivirus:**
   - Temporarily disable firewall/antivirus
   - Check corporate VPN settings
   - Try a different network (mobile hotspot)

3. **Try Pooler Connection:**
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_SWYytZFmgB48@ep-sweet-unit-ahwph4ah-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

4. **Verify Database Credentials:**
   - Login to [Neon Console](https://console.neon.tech)
   - Go to your project → **Connection Details**
   - Copy the connection string and update `.env.local`

5. **Check Neon Project Status:**
   - Ensure your Neon project is active (not suspended)
   - Check if there are any service issues

### Issue: "Invalid email or password" for Admin

**Solution:**
- Admin credentials:
  - Email: `abhiisingh240@gmail.com`
  - Password: `admin123`
- Run database setup: `http://localhost:3000/setup`
- Check that the admin user was created successfully

---

## 📝 Summary

### ✅ Completed Features:

1. **Email-based authentication** for candidates (existing + working)
2. **Google OAuth authentication** for candidates (new - requires Google setup)
3. **Admin password authentication** (existing - needs database connection)

### 🔧 What You Need to Do:

1. **Set up Google OAuth credentials** (follow Steps 1-4 above)
2. **Update `.env.local`** with your Google credentials
3. **Fix database connection** if you're experiencing network issues
4. **Test all three login methods**

### 🎯 Expected Behavior:

- **Candidates** can choose:
  - ✉️ Email + Name (traditional)
  - 🔐 Continue with Google (OAuth)
  
- **Admins** use:
  - ✉️ Email + Password only

---

## 🆘 Need Help?

If you're still experiencing issues:

1. **Check the browser console** for errors (F12 → Console tab)
2. **Check the terminal** where `npm run dev` is running
3. **Verify all environment variables** are set correctly
4. **Try the setup page**: `http://localhost:3000/setup`

---

## 🔒 Security Notes

- Never commit `.env.local` to Git
- Use strong, random secrets in production
- Rotate secrets regularly
- Limit OAuth consent screen to necessary scopes only
- Review Google Cloud Console regularly for suspicious activity

---

**Need more help?** Check the [NextAuth.js Documentation](https://next-auth.js.org/providers/google) for detailed Google provider configuration.

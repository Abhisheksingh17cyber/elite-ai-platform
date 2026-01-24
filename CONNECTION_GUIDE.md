# 🔌 Complete Connection Guide: Neon Database + Google OAuth

## Overview
This guide will connect your Elite AI-Architect platform to:
1. **Neon Database** (PostgreSQL) - For storing users and data
2. **Google OAuth** - For Google Sign-In authentication

---

## 📊 Part 1: Neon Database Setup & Connection

### Step 1: Verify Your Neon Project

1. Go to [Neon Console](https://console.neon.tech/)
2. Login with your account
3. Find your project: **Elite AI-Architect** (or similar name)
4. Check if it's **Active** (not suspended)

### Step 2: Get Connection String

1. In Neon Console, click on your project
2. Go to **Dashboard** → **Connection Details**
3. Copy the **Connection string** (should look like this):

```
postgresql://neondb_owner:npg_SWYytZFmgB48@ep-sweet-unit-ahwph4ah.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Step 3: Update .env.local

Open `.env.local` in your project and update:

```env
# ===== NEON DATABASE =====
DATABASE_URL=postgresql://neondb_owner:npg_SWYytZFmgB48@ep-sweet-unit-ahwph4ah.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Step 4: Fix DNS Issues (If Any)

**Test connection first:**
```bash
node test-connection.js
```

**If you see DNS errors**, follow these steps:

#### Windows DNS Fix:
1. Press `Win + R`
2. Type `ncpa.cpl` and press Enter
3. Right-click your network adapter (Wi-Fi/Ethernet)
4. Click **Properties**
5. Select **Internet Protocol Version 4 (TCP/IPv4)**
6. Click **Properties**
7. Select **Use the following DNS server addresses:**
   - Preferred DNS: `8.8.8.8`
   - Alternate DNS: `8.8.4.4`
8. Click **OK** → **OK**
9. Open PowerShell as Admin and run:
   ```powershell
   ipconfig /flushdns
   ```

### Step 5: Initialize Database Tables

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Go to: `http://localhost:3000/setup`

3. This will automatically create:
   - ✅ `candidates` table
   - ✅ `admins` table  
   - ✅ `test_sessions` table
   - ✅ `code_snapshots` table
   - ✅ `anti_cheat_events` table

4. You should see: **"Database initialized successfully!"**

5. **Default admin account** will be created:
   - Email: `abhiisingh240@gmail.com`
   - Password: `admin123`

---

## 🔐 Part 2: Google OAuth Setup & Connection

### Your Google Project Details:
- **Project Number**: `664603998238`
- **Project ID**: `interview-platform-485320`
- **Project Name**: Interview Platform (or similar)

### Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Select your project: **Interview Platform** (`interview-platform-485320`)
4. Or click this direct link: `https://console.cloud.google.com/apis/dashboard?project=interview-platform-485320`

### Step 2: Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search and enable these APIs:
   - ✅ **Google+ API** (for user profile)
   - ✅ **People API** (for user information)

**Quick Links:**
- Enable APIs: `https://console.cloud.google.com/apis/library?project=interview-platform-485320`

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (allows any Google account)
3. Click **CREATE**

**Fill in these details:**

| Field | Value |
|-------|-------|
| App name | `Elite AI-Architect Challenge Platform` |
| User support email | Your email (abhiisingh240@gmail.com) |
| App logo | (Optional - can add later) |
| Application home page | `http://localhost:3000` |
| Application privacy policy | (Optional for testing) |
| Application terms of service | (Optional for testing) |
| Authorized domains | (Leave empty for localhost testing) |
| Developer contact information | Your email |

4. Click **SAVE AND CONTINUE**

**Scopes:**
1. Click **ADD OR REMOVE SCOPES**
2. Select these scopes:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - ✅ `openid`
3. Click **UPDATE**
4. Click **SAVE AND CONTINUE**

**Test Users (for development):**
1. Click **ADD USERS**
2. Add these emails (accounts you'll use to test):
   - Your email: `abhiisingh240@gmail.com`
   - Any other test emails
3. Click **ADD**
4. Click **SAVE AND CONTINUE**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Application type**: **Web application**

**Configure Web Application:**

| Field | Value |
|-------|-------|
| Name | `Elite AI Platform Web Client` |
| Authorized JavaScript origins | `http://localhost:3000` |
| Authorized redirect URIs | `http://localhost:3000/api/auth/callback/google` |

**CRITICAL**: Make sure the redirect URI is **EXACTLY**:
```
http://localhost:3000/api/auth/callback/google
```

4. Click **CREATE**

### Step 5: Get Your OAuth Credentials

A popup will appear with your credentials:

```
Client ID: 664603998238-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANT**: Copy both values immediately!

**Direct link to credentials:**
`https://console.cloud.google.com/apis/credentials?project=interview-platform-485320`

### Step 6: Update .env.local with Google Credentials

Open `.env.local` and update these lines:

```env
# ===== GOOGLE OAUTH =====
GOOGLE_CLIENT_ID=664603998238-YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-YOUR_ACTUAL_CLIENT_SECRET_HERE
```

**Replace** `YOUR_ACTUAL_CLIENT_ID_HERE` and `YOUR_ACTUAL_CLIENT_SECRET_HERE` with the values you just copied.

### Step 7: Complete .env.local File

Your complete `.env.local` should look like this:

```env
# ===== NEON DATABASE =====
DATABASE_URL=postgresql://neondb_owner:npg_SWYytZFmgB48@ep-sweet-unit-ahwph4ah.us-east-1.aws.neon.tech/neondb?sslmode=require

# ===== NEXTAUTH CONFIGURATION =====
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=elite-ai-platform-secret-key-change-in-production

# ===== GOOGLE OAUTH =====
GOOGLE_CLIENT_ID=664603998238-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ Part 3: Testing Everything

### Step 1: Restart Development Server

**Stop the current server** (Ctrl+C in terminal), then:

```bash
npm run dev
```

Wait for: `✓ Ready in X.XXs`

### Step 2: Test Database Connection

```bash
node test-connection.js
```

**Expected output:**
```
✅ Connection established successfully!
✅ Query executed successfully!
✅ Tables found:
   - admins
   - candidates
   - test_sessions
   - code_snapshots
   - anti_cheat_events
```

### Step 3: Test Admin Login

1. Open: `http://localhost:3000`
2. Click **"Admin"** tab
3. Enter:
   - Email: `abhiisingh240@gmail.com`
   - Password: `admin123`
4. Click **"Sign in as Admin"**
5. ✅ Should redirect to `/admin` dashboard

### Step 4: Test Candidate Email Login

1. Go to: `http://localhost:3000`
2. Click **"Candidate"** tab
3. Enter:
   - Email: `test@example.com`
   - Name: `Test User`
4. Click **"Start Challenge"**
5. ✅ Should redirect to `/challenge` with 45-minute timer

### Step 5: Test Google OAuth Login

1. Go to: `http://localhost:3000`
2. Make sure **"Candidate"** tab is selected
3. Click **"Continue with Google"** button
4. Choose your Google account (must be in test users list)
5. Click **"Continue"** to grant permissions
6. ✅ Should redirect back to `/challenge` automatically
7. ✅ User should be created in `candidates` table

---

## 🔗 Connection Checklist

### Neon Database ✅
- [ ] Neon project is active
- [ ] Connection string copied to `.env.local`
- [ ] DNS issues resolved (if any)
- [ ] `node test-connection.js` passes
- [ ] Setup page (`/setup`) initialized tables
- [ ] Admin account created

### Google OAuth ✅
- [ ] Project selected: `interview-platform-485320`
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] Test users added
- [ ] OAuth 2.0 Client ID created
- [ ] Redirect URI set: `http://localhost:3000/api/auth/callback/google`
- [ ] Client ID copied to `.env.local`
- [ ] Client Secret copied to `.env.local`
- [ ] Dev server restarted

### Application ✅
- [ ] `.env.local` has all 5 variables
- [ ] `npm run dev` running without errors
- [ ] Admin login works
- [ ] Candidate email login works
- [ ] Google OAuth login works

---

## 🚀 Production Deployment (Vercel)

When you're ready to deploy:

### Update Google OAuth for Production:

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials?project=interview-platform-485320)
2. Click on your OAuth 2.0 Client ID
3. Add production URLs:

**Authorized JavaScript origins:**
```
https://your-app.vercel.app
```

**Authorized redirect URIs:**
```
https://your-app.vercel.app/api/auth/callback/google
```

### Update Vercel Environment Variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these:

```env
DATABASE_URL=your-neon-connection-string
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-a-new-strong-secret
GOOGLE_CLIENT_ID=664603998238-xxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxx
```

**Generate strong NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## 🐛 Troubleshooting

### Issue: "OAuth client was not found"

**Cause**: Google credentials not set or incorrect

**Fix**:
1. Double-check `GOOGLE_CLIENT_ID` in `.env.local`
2. Make sure there are no extra spaces or quotes
3. Restart dev server: `Ctrl+C` then `npm run dev`

### Issue: "redirect_uri_mismatch"

**Cause**: Redirect URI doesn't match Google Console settings

**Fix**:
1. Go to [Credentials page](https://console.cloud.google.com/apis/credentials?project=interview-platform-485320)
2. Click your OAuth Client ID
3. Make sure **Authorized redirect URIs** has exactly:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. No trailing slashes, exact match

### Issue: Database Connection Errors

**Symptoms**: `ENOTFOUND`, `Connect Timeout Error`

**Fix**:
1. Follow the DNS fix in Part 1, Step 4
2. Run `node test-connection.js` to verify
3. Try switching to pooler connection:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_SWYytZFmgB48@ep-sweet-unit-ahwph4ah-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### Issue: "Sign in failed. Check the details you provided are correct."

**Cause**: User not in Google test users list

**Fix**:
1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent?project=interview-platform-485320)
2. Scroll to **Test users**
3. Click **ADD USERS**
4. Add the email you're trying to login with

---

## 📋 Quick Reference

### Important URLs:

| Resource | URL |
|----------|-----|
| Your App | http://localhost:3000 |
| Setup Page | http://localhost:3000/setup |
| Admin Dashboard | http://localhost:3000/admin |
| Challenge Page | http://localhost:3000/challenge |
| Google Cloud Console | https://console.cloud.google.com/?project=interview-platform-485320 |
| Google Credentials | https://console.cloud.google.com/apis/credentials?project=interview-platform-485320 |
| Google OAuth Consent | https://console.cloud.google.com/apis/credentials/consent?project=interview-platform-485320 |
| Neon Console | https://console.neon.tech/ |

### Test Commands:

```bash
# Test database connection
node test-connection.js

# Start dev server
npm run dev

# Run database setup
# Visit: http://localhost:3000/setup

# Check DNS
ping ep-sweet-unit-ahwph4ah.us-east-1.aws.neon.tech

# Flush DNS cache
ipconfig /flushdns
```

### Login Credentials:

**Admin:**
```
Email: abhiisingh240@gmail.com
Password: admin123
```

**Candidate (Email):**
```
Any email + name
Example: test@example.com / Test User
```

**Candidate (Google):**
```
Any Google account in test users list
```

---

## 🎯 Next Steps

1. **Complete Neon Setup** (Part 1)
   - Fix DNS if needed
   - Run setup page
   - Test database connection

2. **Complete Google OAuth Setup** (Part 2)
   - Configure consent screen
   - Create OAuth credentials
   - Add test users
   - Update .env.local

3. **Test Everything** (Part 3)
   - Test all three login methods
   - Verify data is saved to database
   - Check that sessions work correctly

4. **Deploy to Production** (Optional)
   - Update Google OAuth URLs
   - Deploy to Vercel
   - Update environment variables

---

## ✅ Success Indicators

You'll know everything is connected when:

✅ `node test-connection.js` shows all green checkmarks
✅ Admin can login with email/password
✅ Candidates can login with email/name
✅ Candidates can login with Google OAuth
✅ 45-minute timer starts on challenge page
✅ User data saves to Neon database
✅ No errors in browser console
✅ No errors in terminal logs

---

**Need help?** Check:
- `TROUBLESHOOTING.md` for connection issues
- `GOOGLE_OAUTH_SETUP.md` for detailed OAuth steps
- `README_SETUP.md` for overall project summary

**Your Project:**
- Google Project ID: `interview-platform-485320`
- Google Project Number: `664603998238`
- Database: Neon PostgreSQL
- Auth: NextAuth.js with Google OAuth

---

**Last Updated**: January 2025
**Status**: Ready to connect
**Time to Complete**: 15-20 minutes

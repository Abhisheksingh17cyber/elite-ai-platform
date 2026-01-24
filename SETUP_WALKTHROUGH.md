# 🚀 Complete Setup Walkthrough - Fix All Authentication Issues

## Current Issues Detected:
1. ❌ Admin login: "Invalid email or password"
2. ❌ Candidate login: "Authentication failed"  
3. ❌ Google OAuth: "Error 400: redirect_uri_mismatch"

Let's fix everything step by step!

---

## ✅ STEP 1: Verify Database Connection (5 minutes)

### Why This Matters:
Both admin and candidate logins are failing because the database can't be reached.

### Action:

**1.1) Open Terminal in your project folder:**
```bash
cd c:\Users\abhii\OneDrive\Desktop\elite-challanges\elite-ai-platform
```

**1.2) Test your database connection:**
```bash
node test-connection.js
```

**1.3) Expected Result:**
```
✅ Connection established successfully!
✅ Query executed successfully!
✅ Tables found: 6 tables
```

**1.4) If You See Errors:**

If you see: `ENOTFOUND` or `Connect Timeout Error`

**Fix DNS Issue:**
1. Press `Win + R`
2. Type: `ncpa.cpl` and press Enter
3. Right-click your **Wi-Fi** or **Ethernet** adapter
4. Click **Properties**
5. Select **Internet Protocol Version 4 (TCP/IPv4)**
6. Click **Properties**
7. Select: **"Use the following DNS server addresses:"**
8. Enter:
   - Preferred DNS: `8.8.8.8`
   - Alternate DNS: `8.8.4.4`
9. Click **OK** → **OK**
10. Open PowerShell as Administrator:
    ```powershell
    ipconfig /flushdns
    ```

**1.5) Test Again:**
```bash
node test-connection.js
```

✅ **Checkpoint: Database connection must work before continuing!**

---

## ✅ STEP 2: Initialize Database Tables (2 minutes)

### Why This Matters:
Your database needs tables to store users and session data.

### Action:

**2.1) Start Development Server:**
```bash
npm run dev
```

Wait for: `✓ Ready in X.XXs`

**2.2) Open Browser:**
Go to: **http://localhost:3000/setup**

**2.3) Expected Result:**
You should see:
- ✓ Candidates table ready
- ✓ Admin users table ready
- ✓ Test sessions table ready
- ✓ Code snapshots table ready
- ✓ Anti-cheat events table ready
- ✓ Default admin account created

**2.4) Admin Credentials Created:**
```
Email: abhiisingh240@gmail.com
Password: admin123
```

✅ **Checkpoint: Setup page must complete successfully!**

---

## ✅ STEP 3: Test Admin Login (2 minutes)

### Why This Matters:
Verify database tables are working correctly.

### Action:

**3.1) Go to Login Page:**
Open: **http://localhost:3000**

**3.2) Click Admin Tab**

**3.3) Enter Credentials:**
- Email: `abhiisingh240@gmail.com`
- Password: `admin123`

**3.4) Click "Sign in as Admin"**

**3.5) Expected Result:**
- ✅ Redirect to: `http://localhost:3000/admin`
- ✅ See admin dashboard

**3.6) If Still Getting "Invalid email or password":**

Check terminal logs where `npm run dev` is running. Look for:
- Database connection errors
- Query errors
- Authentication errors

**Common Fix:**
```bash
# Stop server (Ctrl+C)
# Restart server
npm run dev
```

✅ **Checkpoint: Admin login must work before continuing!**

---

## ✅ STEP 4: Test Candidate Email Login (2 minutes)

### Why This Matters:
Verify candidate authentication is working.

### Action:

**4.1) Go to Login Page:**
Open: **http://localhost:3000**

**4.2) Click Candidate Tab**

**4.3) Enter Test Data:**
- Email: `test@example.com`
- Name: `Test User`

**4.4) Click "Start Challenge"**

**4.5) Expected Result:**
- ✅ Redirect to: `http://localhost:3000/challenge`
- ✅ See 45-minute timer
- ✅ See code editor

✅ **Checkpoint: Candidate login must work before continuing!**

---

## ✅ STEP 5: Setup Google OAuth (10 minutes)

### Why This Matters:
Fix the "redirect_uri_mismatch" error for Google Sign-In.

### Part A: Access Google Cloud Console

**5.1) Open Google Cloud Console:**
Go to: https://console.cloud.google.com/

**5.2) Select Your Project:**
- Click the project dropdown at the top
- Select: **Interview Platform** (Project ID: `interview-platform-485320`)
- Or use direct link: https://console.cloud.google.com/apis/dashboard?project=interview-platform-485320

### Part B: Enable Required APIs

**5.3) Enable Google+ API:**
1. Go to: https://console.cloud.google.com/apis/library?project=interview-platform-485320
2. Search: `Google+ API`
3. Click on it
4. Click: **ENABLE**

**5.4) Enable People API (optional but recommended):**
1. Search: `People API`
2. Click on it
3. Click: **ENABLE**

### Part C: Configure OAuth Consent Screen

**5.5) Go to OAuth Consent Screen:**
Direct link: https://console.cloud.google.com/apis/credentials/consent?project=interview-platform-485320

**5.6) If Not Configured Yet:**
1. Choose: **External** (allows any Google account to test)
2. Click: **CREATE**

**5.7) Fill in Required Fields:**

| Field | Enter This |
|-------|------------|
| App name | `Elite AI Challenge Platform` |
| User support email | `abhiisingh240@gmail.com` |
| Developer contact email | `abhiisingh240@gmail.com` |

3. Click: **SAVE AND CONTINUE**

**5.8) Add Scopes:**
1. Click: **ADD OR REMOVE SCOPES**
2. Filter and select these scopes:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - ✅ `openid`
3. Click: **UPDATE**
4. Click: **SAVE AND CONTINUE**

**5.9) Add Test Users:**
1. Click: **ADD USERS**
2. Add your email: `abhiisingh240@gmail.com`
3. Add any other emails you want to test with
4. Click: **ADD**
5. Click: **SAVE AND CONTINUE**

### Part D: Create OAuth 2.0 Credentials

**5.10) Go to Credentials:**
Direct link: https://console.cloud.google.com/apis/credentials?project=interview-platform-485320

**5.11) Create OAuth Client ID:**
1. Click: **CREATE CREDENTIALS**
2. Select: **OAuth client ID**
3. Application type: **Web application**

**5.12) Configure the Client:**

| Field | Enter This EXACTLY |
|-------|-------------------|
| Name | `Elite AI Platform Web Client` |
| Authorized JavaScript origins | `http://localhost:3000` |
| Authorized redirect URIs | `http://localhost:3000/api/auth/callback/google` |

⚠️ **CRITICAL:** The redirect URI must be **EXACTLY**:
```
http://localhost:3000/api/auth/callback/google
```

- ✅ Correct: `http://localhost:3000/api/auth/callback/google`
- ❌ Wrong: `http://localhost:3000/api/auth/callback/google/`
- ❌ Wrong: `https://localhost:3000/api/auth/callback/google`
- ❌ Wrong: `http://localhost:3000/callback/google`

4. Click: **CREATE**

**5.13) Copy Your Credentials:**

You'll see a popup with:
```
Client ID: 664603998238-xxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANT:** 
- Copy **Client ID** to Notepad
- Copy **Client Secret** to Notepad
- Keep this window open or save the credentials

✅ **Checkpoint: You now have Google OAuth credentials!**

---

## ✅ STEP 6: Update Environment Variables (3 minutes)

### Why This Matters:
Your app needs these credentials to communicate with Google.

### Action:

**6.1) Open `.env.local` File:**

In VS Code, open: `c:\Users\abhii\OneDrive\Desktop\elite-challanges\elite-ai-platform\.env.local`

**6.2) You Should See:**
```env
# Neon Database Connection (using pooler endpoint for serverless)
DATABASE_URL=postgresql://neondb_owner:npg_SWYytZFmgB48@ep-sweet-unit-ahwph4ah-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=9+DXkwlytPGIDq+NtoFAG6V5IQhyWnePwmDJ35FZHOc=

# Google OAuth (Get from Google Cloud Console)
# Follow setup instructions in README.md
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**6.3) Replace the Last Two Lines:**

Change from:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

To (use YOUR actual values from Step 5.13):
```env
GOOGLE_CLIENT_ID=664603998238-xxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
```

**6.4) Save the File:**
Press `Ctrl+S`

**6.5) Complete .env.local Should Look Like:**
```env
# Neon Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_...@ep-sweet-unit-ahwph4ah-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=9+DXkwlytPGIDq+NtoFAG6V5IQhyWnePwmDJ35FZHOc=

# Google OAuth
GOOGLE_CLIENT_ID=664603998238-abc123xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz456
```

✅ **Checkpoint: Environment variables are configured!**

---

## ✅ STEP 7: Restart Server & Test Google OAuth (3 minutes)

### Why This Matters:
Server needs to reload with new Google credentials.

### Action:

**7.1) Stop Development Server:**
- Go to terminal where `npm run dev` is running
- Press: `Ctrl+C`

**7.2) Restart Server:**
```bash
npm run dev
```

Wait for: `✓ Ready in X.XXs`

**7.3) Test Google OAuth:**

1. Open: **http://localhost:3000**
2. Click: **Candidate** tab
3. Click: **"Continue with Google"** button
4. Choose your Google account (`abhiisingh240@gmail.com`)
5. Click: **"Continue"** to grant permissions

**7.4) Expected Result:**
- ✅ Redirects back to your app
- ✅ Automatically creates candidate record
- ✅ Redirects to: `http://localhost:3000/challenge`
- ✅ See 45-minute timer

**7.5) If You Still See "redirect_uri_mismatch":**

Go back to Google Cloud Console:
1. https://console.cloud.google.com/apis/credentials?project=interview-platform-485320
2. Click on your **OAuth 2.0 Client ID**
3. Verify **Authorized redirect URIs** has EXACTLY:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. Save changes
5. Wait 1 minute for changes to propagate
6. Try again

✅ **Checkpoint: Google OAuth must work!**

---

## 🎯 VERIFICATION CHECKLIST

### Database & Tables:
- [ ] `node test-connection.js` shows "✅ Connection established"
- [ ] Setup page created 5+ tables
- [ ] No errors in terminal logs

### Admin Login:
- [ ] Can login with `abhiisingh240@gmail.com` / `admin123`
- [ ] Redirects to `/admin` dashboard
- [ ] No "Invalid email or password" error

### Candidate Email Login:
- [ ] Can enter email + name
- [ ] Redirects to `/challenge` page
- [ ] Timer starts (45 minutes)
- [ ] No "Authentication failed" error

### Google OAuth:
- [ ] OAuth consent screen configured
- [ ] Test users added
- [ ] Client ID created
- [ ] Redirect URI is EXACTLY: `http://localhost:3000/api/auth/callback/google`
- [ ] Credentials in `.env.local`
- [ ] "Continue with Google" button works
- [ ] No "redirect_uri_mismatch" error

---

## 🔍 TROUBLESHOOTING

### Problem: Admin Login Still Fails

**Check 1: Database Tables**
```bash
node test-connection.js
```
Should show: admin_users table exists

**Check 2: Terminal Logs**
Look for errors like:
- `NeonDbError`
- `fetch failed`
- `Connection refused`

**Check 3: Password Hash**
Run this command:
```bash
node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('admin123').digest('hex'));"
```
Should output: `240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9`

**Fix:**
1. Go to: http://localhost:3000/setup
2. Re-run setup
3. Try login again

### Problem: Candidate Login Fails

**Check 1: Database Connection**
```bash
node test-connection.js
```

**Check 2: Check NextAuth API Route**
Open browser console (F12) when clicking "Start Challenge"
Look for:
- 500 errors
- 404 errors on `/api/auth/callback/credentials`

**Fix:**
```bash
# Rebuild the project
npm run build
npm run dev
```

### Problem: Google OAuth "redirect_uri_mismatch"

**Check 1: Exact Match**
In Google Cloud Console, redirect URI must be:
```
http://localhost:3000/api/auth/callback/google
```

NOT:
- `http://localhost:3000/api/auth/callback/google/` (trailing slash)
- `https://localhost:3000/api/auth/callback/google` (https)
- `http://localhost:3000/callback/google` (missing /api/auth/)

**Check 2: Project Selected**
Make sure you're in project: `interview-platform-485320`

**Check 3: Wait for Propagation**
After saving redirect URI, wait 1-2 minutes before testing.

### Problem: "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen not configured or app not verified

**Fix:**
1. Go to: https://console.cloud.google.com/apis/credentials/consent?project=interview-platform-485320
2. Make sure you added test users
3. Add your email: `abhiisingh240@gmail.com`
4. Save changes
5. Try again

### Problem: Terminal Shows Errors

**Error: "Cannot find module '@neondatabase/serverless'"**
```bash
npm install @neondatabase/serverless
```

**Error: "Cannot find module 'next-auth'"**
```bash
npm install next-auth
```

**Error: "Port 3000 is already in use"**
```bash
# Stop all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
npm run dev
```

---

## 📊 Connection Architecture

Here's what connects to what:

```
┌─────────────────────────────────────────────────────┐
│                  YOUR BROWSER                        │
│              http://localhost:3000                   │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              NEXT.JS SERVER                          │
│         (npm run dev on port 3000)                   │
├─────────────────────────────────────────────────────┤
│  Routes:                                             │
│  • /                   (Login page)                  │
│  • /admin              (Admin dashboard)             │
│  • /challenge          (Candidate challenge)         │
│  • /api/auth/[...nextauth]  (NextAuth handler)      │
│  • /api/db/init        (Database setup)              │
└──────────┬──────────────────────────────┬───────────┘
           │                              │
           │                              │
           ▼                              ▼
┌──────────────────────┐    ┌──────────────────────────┐
│   NEON DATABASE      │    │   GOOGLE OAUTH           │
│   (PostgreSQL)       │    │   (authentication)       │
├──────────────────────┤    ├──────────────────────────┤
│ Host: ep-sweet-unit- │    │ Project ID:              │
│  ahwph4ah-pooler     │    │  interview-platform-     │
│  .c-3.us-east-1      │    │   485320                 │
│  .aws.neon.tech      │    │                          │
│                      │    │ Redirect URI:            │
│ Database: neondb     │    │  http://localhost:3000   │
│ User: neondb_owner   │    │  /api/auth/callback/     │
│                      │    │  google                  │
│ Tables:              │    │                          │
│ • admin_users        │    │ Client ID: 664603...     │
│ • candidates         │    │ Client Secret: GOCSPX... │
│ • test_sessions      │    │                          │
│ • code_snapshots     │    │ Test Users:              │
│ • anti_cheat_events  │    │ • abhiisingh240@...      │
└──────────────────────┘    └──────────────────────────┘
```

### Data Flow for Admin Login:
```
1. User enters email + password → POST /api/auth/callback/credentials
2. Server queries: SELECT * FROM admin_users WHERE email = '...'
3. Server verifies password hash (SHA-256)
4. If match: Create session → Redirect to /admin
5. If no match: Return "Invalid email or password"
```

### Data Flow for Candidate Email Login:
```
1. User enters email + name → POST /api/auth/callback/credentials
2. Server queries: SELECT * FROM candidates WHERE email = '...'
3. If not exists: INSERT INTO candidates (email, name)
4. Create session → Redirect to /challenge
```

### Data Flow for Google OAuth:
```
1. User clicks "Continue with Google" → GET /api/auth/signin/google
2. Redirect to Google OAuth: consent.google.com
3. User grants permissions
4. Google redirects: http://localhost:3000/api/auth/callback/google?code=...
5. Server exchanges code for user info (email, name)
6. Server queries: SELECT * FROM candidates WHERE email = '...'
7. If not exists: INSERT INTO candidates (email, name, google_id)
8. Create session → Redirect to /challenge
```

---

## 🎉 SUCCESS INDICATORS

When everything is working correctly, you should be able to:

1. **Admin Flow:**
   - Go to http://localhost:3000
   - Click "Admin" tab
   - Enter: abhiisingh240@gmail.com / admin123
   - Click "Sign in as Admin"
   - ✅ See admin dashboard at /admin

2. **Candidate Email Flow:**
   - Go to http://localhost:3000
   - Click "Candidate" tab
   - Enter: test@example.com / Test User
   - Click "Start Challenge"
   - ✅ See challenge page with 45-minute timer

3. **Google OAuth Flow:**
   - Go to http://localhost:3000
   - Click "Candidate" tab
   - Click "Continue with Google"
   - Select your Google account
   - Grant permissions
   - ✅ Automatically redirected to challenge page

4. **No Errors:**
   - ✅ No red error messages on login page
   - ✅ No errors in browser console (F12)
   - ✅ No errors in terminal logs

---

## 📝 FINAL CHECKLIST

Before you're done, verify:

### Environment (.env.local)
- [ ] DATABASE_URL points to Neon pooler endpoint
- [ ] NEXTAUTH_URL is http://localhost:3000
- [ ] NEXTAUTH_SECRET is set (32-byte random string)
- [ ] GOOGLE_CLIENT_ID starts with 664603998238-
- [ ] GOOGLE_CLIENT_SECRET starts with GOCSPX-

### Google Cloud Console
- [ ] Project: interview-platform-485320 selected
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] Test users added (abhiisingh240@gmail.com)
- [ ] OAuth 2.0 Client ID created
- [ ] Redirect URI: http://localhost:3000/api/auth/callback/google

### Database
- [ ] Connection test passes (node test-connection.js)
- [ ] Setup page completed (/setup)
- [ ] 5+ tables created
- [ ] Admin user exists (abhiisingh240@gmail.com)

### Application
- [ ] Dev server running (npm run dev)
- [ ] No errors in terminal
- [ ] All three login methods work
- [ ] Sessions persist after login
- [ ] Timer starts on challenge page

---

## 🆘 STILL HAVING ISSUES?

### Get Help:

1. **Check Browser Console:**
   - Press F12
   - Go to Console tab
   - Look for red errors
   - Copy the error message

2. **Check Terminal Logs:**
   - Look at terminal where `npm run dev` is running
   - Find any red errors or warnings
   - Copy the error message

3. **Run Diagnostics:**
   ```bash
   # Test database
   node test-connection.js
   
   # Check environment
   node -e "console.log(process.env.DATABASE_URL ? 'DB URL is set' : 'DB URL missing')"
   node -e "console.log(process.env.GOOGLE_CLIENT_ID ? 'Google Client ID is set' : 'Google Client ID missing')"
   ```

4. **Common Quick Fixes:**
   ```bash
   # Clean restart
   Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
   Remove-Item -Recurse -Force .next
   npm run build
   npm run dev
   ```

---

**Good luck! If you follow these steps exactly, everything should work! 🚀**

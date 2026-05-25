# RENTFLOW Production Deployment - EXACT COMMANDS

## Summary of Prepared Files

The following files have been created/updated for production deployment:

### New Files Created:
1. ✅ `vercel.json` - Vercel deployment configuration
2. ✅ `DEPLOYMENT.md` - Complete deployment guide (17 sections)
3. ✅ `QUICK_START_DEPLOYMENT.md` - Quick reference guide
4. ✅ `PRODUCTION_CHECKLIST.md` - Pre-deployment checklist
5. ✅ `middleware.ts` - Production middleware for security headers
6. ✅ `lib/errorMonitoring.ts` - Error logging and monitoring
7. ✅ `lib/securityUtils.ts` - Security utilities (created earlier)
8. ✅ `lib/cors.ts` - CORS configuration (created earlier)

### Updated Files:
1. ✅ `package.json` - Added production scripts
2. ✅ `lib/env.ts` - Added security variables
3. ✅ `lib/authValidation.ts` - Enhanced password policy
4. ✅ `next.config.ts` - Enhanced security headers
5. ✅ `lib/customerValidation.ts` - Stricter validation
6. ✅ `app/api/auth/logout/route.ts` - Rate limiting added
7. ✅ `app/api/auth/session/route.ts` - Rate limiting + status check
8. ✅ `app/api/inventory/upload/route.ts` - Enhanced validation
9. ✅ `services/auth.ts` - Enhanced security checks
10. ✅ `.env.example` - Security-focused template

---

## STEP-BY-STEP: GitHub Initial Commit

### Run These Commands in PowerShell

```powershell
# 1. Navigate to project folder
cd "c:\Users\Hp Users\Desktop\SKS\SKS LABS\RENTFLOW\rentflow"

# 2. Verify you're in the right folder
Get-Location

# 3. Initialize git (if not already done)
git init

# 4. Configure git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 5. Check git status
git status

# 6. Add all files
git add .

# 7. Create commit
git commit -m "Initial commit: RENTFLOW rental management system

- Production-ready configuration
- Security hardened (OWASP Top 10)
- Database migrations prepared
- Vercel deployment ready
- Error monitoring and logging
- Rate limiting and CORS protection"

# 8. Verify commit
git log --oneline

# 9. Add GitHub as remote (replace YOUR_USERNAME)
git remote add origin "https://github.com/YOUR_USERNAME/RENTFLOW.git"

# 10. Verify remote
git remote -v

# 11. Rename branch to main
git branch -M main

# 12. Push to GitHub (first time uses -u)
git push -u origin main

# 13. Verify push
git log --oneline | head -5
```

---

## STEP-BY-STEP: Vercel Deployment

### Part 1: Create Vercel Project

```
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Search for "RENTFLOW"
5. Click Import
6. Wait for auto-configuration
7. Click "Deploy"
```

### Part 2: Add Environment Variables

After project is created, click Settings → Environment Variables

Add these variables (replace with your actual values):

**Individual Commands (copy each as separate variable):**

```
DATABASE_URL = postgresql://user:password@host:5432/rentflow_prod
JWT_SECRET = [64-char random string]
NODE_ENV = production
ALLOWED_ORIGIN = https://rentflow-xxxx.vercel.app
NEXT_PUBLIC_API_URL = https://rentflow-xxxx.vercel.app
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 10
LOG_SECURITY_EVENTS = true
SESSION_TIMEOUT_MINUTES = 10080
```

### Part 3: Generate JWT_SECRET

Run this command in PowerShell to get a secure random secret:

```powershell
# Option 1: Using PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)) | Write-Host

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and use as JWT_SECRET in Vercel
```

### Part 4: Choose Database

**Option A: Vercel PostgreSQL (Easiest)**
```
1. Vercel Dashboard → Storage
2. Click "Create Database" → PostgreSQL
3. Click "Create"
4. Approve
5. DATABASE_URL automatically added
```

**Option B: Supabase**
```
1. Go to https://supabase.com/dashboard
2. New Project → Name: rentflow
3. Generate strong password
4. Create
5. Wait 2-3 minutes
6. Settings → Database → Copy "Connection pooling string"
7. Paste as DATABASE_URL in Vercel
```

**Option C: Neon**
```
1. Go to https://console.neon.tech
2. New Project → Name: rentflow
3. Create
4. Copy connection string
5. Paste as DATABASE_URL in Vercel
```

### Part 5: Deploy

```
1. All environment variables set?
2. Click "Deploy" in Vercel
3. Wait 2-5 minutes
4. See "Congratulations" message?
5. Click "Visit" to see production URL
```

---

## STEP-BY-STEP: Local Build Test

Run these commands locally before pushing:

```powershell
# 1. Verify production build
npm run production:verify

# 2. Should see no errors

# 3. Test local production build
npm run build

# 4. Start production server
npm run start

# 5. Visit http://localhost:3000
# 6. Test login page loads
# 7. Ctrl+C to stop

# 8. All working? Then safe to push!
```

---

## STEP-BY-STEP: Database Migrations

```powershell
# Before first deployment, locally:

# 1. Generate Prisma client
npm run prisma:generate

# 2. Check migration status
npm run prisma:migrate status

# 3. If migrations pending:
npm run prisma:migrate:dev

# After Vercel deployment:
# Migrations run automatically!
# They're applied during build phase
```

---

## STEP-BY-STEP: Post-Deployment Tests

```powershell
# Test your production URL

# 1. Homepage
# Visit: https://rentflow-xxxx.vercel.app/
# Should see: Landing page with login link

# 2. Login Page
# Visit: https://rentflow-xxxx.vercel.app/login
# Should see: Login form

# 3. Create Account
# Visit: https://rentflow-xxxx.vercel.app/signup
# Should see: Signup form
# Try creating account with valid password (12+ chars, complexity)

# 4. Login
# Use credentials just created
# Should redirect to: /dashboard

# 5. Dashboard
# Should see: Main dashboard content
# No error messages

# 6. Check Security Headers
# Open browser DevTools (F12)
# Network tab
# Click any request
# Response Headers tab
# Should see:
#   - strict-transport-security
#   - content-security-policy
#   - x-frame-options: DENY
```

---

## QUICK COMMANDS: Future Deployments

After first deployment, all future deployments are automatic:

```powershell
# Make changes locally
# Edit file...

# Stage changes
git add .

# Commit
git commit -m "Your descriptive message"

# Push
git push origin main

# Done! Vercel auto-deploys in 1-2 minutes
```

---

## EMERGENCY: Rollback

If something breaks in production:

```powershell
# Method 1: Git Revert
git revert HEAD
git push origin main

# Vercel will deploy previous version

# Method 2: Vercel Dashboard
# Go to Vercel dashboard
# Deployments tab
# Find last working deployment
# Click ... menu
# Select "Promote to Production"
```

---

## Environment Variables Quick Reference

| Variable | Example | Required | Notes |
|---|---|---|---|
| `DATABASE_URL` | `postgresql://...` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | `[64 random chars]` | ✅ | Use generated secret, minimum 32 chars |
| `NODE_ENV` | `production` | ✅ | Must be "production" for prod |
| `ALLOWED_ORIGIN` | `https://rentflow-xxxx.vercel.app` | ✅ | Your production domain |
| `NEXT_PUBLIC_API_URL` | `https://rentflow-xxxx.vercel.app` | ✅ | Public API URL |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | ⬜ | Seconds (default: 60) |
| `RATE_LIMIT_MAX_REQUESTS` | `10` | ⬜ | Max requests per window (default: 10) |
| `LOG_SECURITY_EVENTS` | `true` | ⬜ | Enable security logging (default: true) |
| `SESSION_TIMEOUT_MINUTES` | `10080` | ⬜ | 7 days by default |

---

## Troubleshooting Quick Reference

### Build Fails on Vercel
```
1. Click Deployments tab
2. Find failed deployment
3. Click "View Build Logs"
4. Read error message
5. Fix locally
6. Push fix: git push origin main
```

### Database Connection Error
```
1. Verify DATABASE_URL in Vercel matches actual connection string
2. Test connection locally: npm run prisma:db:execute
3. Ensure PostgreSQL database exists
4. Check credentials are correct
```

### 502/503 Errors
```
1. Database might be down - check Vercel dashboard
2. Check deployment logs
3. Verify DATABASE_URL is set
4. Try redeploying: git push origin main
```

### Login Not Working
```
1. Check JWT_SECRET is set in Vercel
2. Verify DATABASE_URL is correct
3. Check error logs in Vercel dashboard
4. Test locally: npm run dev
```

---

## Success Checklist

✅ Git initialized locally  
✅ Files committed with meaningful message  
✅ GitHub repository created  
✅ Code pushed to GitHub  
✅ Vercel project created  
✅ Environment variables configured  
✅ PostgreSQL database created  
✅ Initial deployment successful  
✅ Production URL accessible  
✅ Login page loads  
✅ Security headers present  
✅ Database migrations applied  
✅ Error monitoring active  

---

## Files Ready for Deployment

All files are properly configured and ready:

✅ Source code - Production ready  
✅ Configuration files - Security hardened  
✅ Environment templates - Documented  
✅ Database migrations - Prepared  
✅ Error monitoring - Configured  
✅ Security middleware - In place  
✅ Deployment configs - Optimized  
✅ Documentation - Comprehensive  

---

**NEXT STEPS:**
1. Run the GitHub commands above
2. Create Vercel account
3. Connect GitHub to Vercel
4. Add environment variables
5. Deploy!

---

**Last Updated**: 2026-05-25
**Version**: 1.0 - Production Ready

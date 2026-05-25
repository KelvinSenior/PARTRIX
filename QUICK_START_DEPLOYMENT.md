# RENTFLOW Production Deployment - QUICK REFERENCE

## Part 1: GitHub Initial Commit & Push (Windows PowerShell)

### Prerequisites
- [ ] Git installed and configured
- [ ] GitHub account created
- [ ] RENTFLOW repository created on GitHub

### Exact Commands (Copy & Paste)

```powershell
# Navigate to project folder
cd "c:\Users\Hp Users\Desktop\SKS\SKS LABS\RENTFLOW\rentflow"

# Initialize git repository
git init

# Configure git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: RENTFLOW rental management system with production security"

# Show commit log to verify
git log --oneline

# Add remote repository (replace YOUR_USERNAME)
git remote add origin "https://github.com/YOUR_USERNAME/RENTFLOW.git"

# Rename branch to main (if needed)
git branch -M main

# Verify remote added
git remote -v

# Push to GitHub (first time)
git push -u origin main

# Verify push successful
git log --oneline | head -3
git remote show origin
```

---

## Part 2: Production Environment Setup

### Create `.env.production.local` (For Local Testing)

```powershell
# Create the file
New-Item -Path ".env.production.local" -ItemType File

# Edit with your values - use Notepad
notepad .env.production.local
```

**Content to add:**
```
DATABASE_URL=postgresql://user:password@host:port/rentflow_prod
JWT_SECRET=your-64-character-random-secret-here
NODE_ENV=production
ALLOWED_ORIGIN=https://yourdomain.vercel.app
NEXT_PUBLIC_API_URL=https://yourdomain.vercel.app
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=10
LOG_SECURITY_EVENTS=true
SESSION_TIMEOUT_MINUTES=10080
```

### Verify Production Build Locally

```powershell
# Run all verification checks
npm run production:verify

# If passes, build is production-ready
# If fails, fix errors before deployment

# Run local tests
npm run build
npm run start

# Test at http://localhost:3000
# Ctrl+C to stop
```

---

## Part 3: PostgreSQL Database Setup (Choose One)

### Option A: Vercel PostgreSQL (Easiest)
```
1. Go to https://vercel.com/dashboard
2. Select RENTFLOW project
3. Storage → Create Database → PostgreSQL
4. Click Create → Approve
5. DATABASE_URL automatically added
```

### Option B: Supabase
```
1. Go to https://supabase.com/dashboard
2. New Project
3. Name: rentflow, Password: [generate], Create
4. Settings → Database → Copy connection string
5. Use as DATABASE_URL in Vercel
```

### Option C: Neon
```
1. Go to https://console.neon.tech
2. New Project → Name: rentflow → Create
3. Copy connection string
4. Use as DATABASE_URL in Vercel
```

---

## Part 4: Vercel Deployment

### Step 1: Connect Vercel to GitHub
```
1. Go to https://vercel.com/import
2. Select GitHub
3. Authorize Vercel to access your GitHub
4. Select RENTFLOW repository
5. Click Import
```

### Step 2: Configure Environment Variables in Vercel
```
1. Vercel Dashboard → RENTFLOW Project
2. Settings → Environment Variables
3. Add each variable:
```

| Variable Name | Value |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | 64-character random string |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGIN` | `https://rentflow-xxxx.vercel.app` |
| `NEXT_PUBLIC_API_URL` | `https://rentflow-xxxx.vercel.app` |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` |
| `RATE_LIMIT_MAX_REQUESTS` | `10` |
| `LOG_SECURITY_EVENTS` | `true` |
| `SESSION_TIMEOUT_MINUTES` | `10080` |

### Step 3: Deploy
```
1. Click Deploy
2. Wait 2-5 minutes for build to complete
3. Check deployment status
4. Click domain link when ready
```

---

## Part 5: Run Database Migrations

### Before First Deployment
```powershell
# Generate Prisma Client (local)
npm run prisma:generate

# Create migrations (if schema changed)
npm run prisma:migrate:dev

# After Vercel deployment:
# Migrations auto-run on deployment
# View status: npm run prisma:migrate status
```

---

## Part 6: Post-Deployment Verification

### Test Production URL
```powershell
# Visit your production URL
# https://rentflow-xxxx.vercel.app

# Test these:
✅ Homepage loads
✅ Login page loads
✅ Create test account
✅ Login succeeds
✅ Dashboard loads
✅ Navigation works
✅ API responses
```

### Check Security Headers
```powershell
# Use this command to check headers:
Invoke-WebRequest -Uri "https://rentflow-xxxx.vercel.app" -Headers @{} | ForEach-Object {$_.Headers}

# Should see:
# - strict-transport-security
# - content-security-policy
# - x-frame-options: DENY
```

---

## Part 7: Ongoing Deployments

### Automatic (Every Push to Main)
```powershell
# Changes auto-deploy when you push
git add .
git commit -m "Your changes"
git push origin main
# Vercel deploys automatically!
```

### Manual Deployment Commands
```powershell
# Update production build locally first
npm run production:verify
npm run build

# Verify everything works
npm run start

# Then commit and push
git add .
git commit -m "Your changes"
git push origin main
```

---

## Part 8: Monitoring & Maintenance

### Weekly
```powershell
# Check for security updates
npm audit

# Update dependencies
npm update

# Run tests
npm run lint
npm run type-check
```

### Monthly
```powershell
# Full security audit
npm audit --audit-level=moderate

# Update all dependencies
npm update --save

# Commit updates
git add package*.json
git commit -m "Monthly dependency update"
git push origin main
```

### Quarterly
```powershell
# Full security check
npm audit fix

# Run production verification
npm run production:verify

# Database backup
# (Vercel/Supabase handles automatically)
```

---

## Emergency: Rollback Procedure

If production has issues:

### Method 1: Git Rollback
```powershell
# See recent commits
git log --oneline | head -10

# Revert last commit
git revert HEAD
git push origin main

# Vercel will deploy the reverted version
```

### Method 2: Vercel Dashboard Rollback
```
1. Vercel Dashboard → RENTFLOW
2. Deployments tab
3. Find working deployment
4. Click "..." menu
5. Select "Promote to Production"
```

---

## Troubleshooting

### Build Fails
```
1. Check Environment Variables in Vercel
2. Check DATABASE_URL is correct
3. Run locally: npm run build
4. Check console output for errors
5. Fix errors, commit, push
```

### Database Connection Error
```
1. Verify DATABASE_URL format
2. Test database connection
3. Check database is accessible from Vercel
4. Verify credentials
```

### 502/503 Errors
```
1. Check database is accessible
2. Check logs in Vercel dashboard
3. Restart deployment
4. Check APPLICATION logs
```

---

## Success Confirmation Checklist

✅ Git repository created on GitHub  
✅ GitHub repository cloned locally  
✅ Vercel project connected to GitHub  
✅ Environment variables configured in Vercel  
✅ PostgreSQL database created and accessible  
✅ Initial deployment successful  
✅ Production URL accessible  
✅ Login functionality works  
✅ Dashboard loads correctly  
✅ Security headers present  
✅ HTTPS working  
✅ Monitoring/alerts configured  

---

## Contact & Support

- **Documentation**: See DEPLOYMENT.md and PRODUCTION_CHECKLIST.md
- **GitHub Issues**: Create issues on your GitHub repo
- **Vercel Help**: https://vercel.com/help
- **Prisma Docs**: https://www.prisma.io/docs

---

**Last Updated**: 2026-05-25
**Quick Reference Version**: 1.0

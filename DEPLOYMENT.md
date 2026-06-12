# Partrix Production Deployment Guide

## Complete Step-by-Step Production Deployment

### Phase 1: GitHub Setup & Initial Commit

#### Step 1: Initialize Git Repository
```bash
cd c:\Users\Hp Users\Desktop\SKS\SKS LABS\Partrix\partrix

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Partrix rental management system with production security"
```

#### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `Partrix`
3. Description: `Enterprise rental management system with booking, inventory, and finance management`
4. Choose: Public or Private
5. Click "Create repository"

#### Step 3: Push to GitHub
```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/Partrix.git

# Rename branch to main if needed
git branch -M main

# Push to GitHub
git push -u origin main
```

---

### Phase 2: Environment Variables Setup

#### Step 1: Vercel Environment Configuration
1. Go to https://vercel.com/dashboard
2. New Project → Import Git Repository → Select Partrix
3. Click "Deploy"

#### Step 2: After Vercel Project Created
1. Go to your Vercel dashboard
2. Select Partrix project
3. Settings → Environment Variables
4. Add each variable with values from your local `.env` file:

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-64-character-random-string
NODE_ENV=production
ALLOWED_ORIGIN=https://partrix-xxxx.vercel.app
NEXT_PUBLIC_API_URL=https://partrix-xxxx.vercel.app
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=10
LOG_SECURITY_EVENTS=true
SESSION_TIMEOUT_MINUTES=10080
```

#### Step 3: Generate Production JWT_SECRET
```bash
# Run this in Node.js or PowerShell
# Method 1: PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)) | Write-Host

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as `JWT_SECRET` in Vercel.

---

### Phase 3: Database Setup (PostgreSQL Cloud)

#### Option A: Using Vercel PostgreSQL (Recommended)
1. Go to Vercel dashboard
2. Select Partrix project
3. Storage tab → Create Database → PostgreSQL
4. Click "Create" and approve
5. Vercel automatically adds `DATABASE_URL` to environment variables

#### Option B: Using Supabase
1. Go to https://supabase.com/dashboard
2. New Project
3. Project name: `partrix`
4. Region: Choose closest to you
5. Password: Generate strong password
6. Create project
7. Go to Settings → Database
8. Copy connection string (PostgreSQL)
9. Add as `DATABASE_URL` in Vercel Environment Variables

#### Option C: Using Neon
1. Go to https://console.neon.tech
2. New Project
3. Name: `partrix`
4. Create database
5. Copy connection string
6. Add as `DATABASE_URL` in Vercel Environment Variables

#### Step 4: Run Database Migrations
```bash
# Make sure DATABASE_URL is set in local .env.local
# Run migrations
npm run prisma:migrate

# Optional: Seed database with initial data
npm run prisma:seed
```

---

### Phase 4: Production Build & Optimization

#### Step 1: Verify Build Configuration
```bash
# Test production build locally
npm run build

# Check for build errors
npm run lint

# Run type checking
npm run type-check
```

#### Step 2: Optimize Images & Assets
All images should be optimized. Next.js will handle this automatically with `next/image`.

#### Step 3: Create Production Environment File Template
Create `.env.production.example` for documentation:
```bash
# This is an example. Never commit actual values.
DATABASE_URL=postgresql://[PRODUCTION_DATABASE_URL]
JWT_SECRET=[STRONG_RANDOM_32_CHAR_SECRET]
NODE_ENV=production
ALLOWED_ORIGIN=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

---

### Phase 5: GitHub Commit Before Deployment

```bash
# Ensure all changes are ready
git status

# Add production configuration files
git add .

# Commit with message
git commit -m "Production ready: optimized build, security hardened, database migrations prepared"

# Push to GitHub
git push origin main

# Vercel will automatically deploy on push!
```

---

### Phase 6: Vercel Deployment

#### Automatic Deployment (Already Set Up)
- Vercel watches your GitHub repository
- Every push to `main` branch automatically deploys
- Deployment preview on PR commits

#### Manual Deployment if Needed
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project folder
vercel --prod
```

#### Post-Deployment Steps
1. Wait for deployment to complete (2-3 minutes)
2. Check deployment logs for errors
3. Visit your production URL
4. Test login functionality
5. Check API endpoints
6. Monitor error logs

---

### Phase 7: Production Security Verification

#### SSL/TLS
- ✅ Vercel provides free HTTPS with auto-renewal
- ✅ HSTS header is enabled in production config

#### Environment Variables
- ✅ All variables secure in Vercel
- ✅ Never committed to GitHub
- ✅ Separate from development

#### Database Security
- ✅ Connection via secure connection string
- ✅ Password protected
- ✅ Network restricted (if using Neon/Supabase)

#### Monitoring
- ✅ Vercel Analytics enabled
- ✅ Error tracking with error logs
- ✅ Performance monitoring

---

### Phase 8: Post-Deployment Checklist

#### DNS Configuration (Optional)
If using custom domain:
1. Go to Vercel dashboard → Domains
2. Add your domain
3. Update DNS records at your domain registrar
4. Wait for DNS propagation (5-30 minutes)

#### Monitoring & Logging
1. Vercel dashboard → Monitoring
2. Set up alerts for errors
3. Monitor performance metrics
4. Review access logs

#### Backup & Recovery
1. Enable Vercel automated backups
2. Set up database backups
3. Document recovery procedures

---

### Phase 9: Ongoing Maintenance

#### Weekly
- Monitor error rates
- Check performance metrics
- Review security logs

#### Monthly
- Update dependencies: `npm update`
- Run security audit: `npm audit`
- Backup database
- Review access logs

#### Quarterly
- Full security audit
- Performance optimization review
- Dependency upgrades

---

## Rollback Procedure

If deployment has issues:

```bash
# Vercel automatically keeps previous deployments
# Go to Vercel dashboard → Deployments
# Click "Rollback" on previous working version

# Or revert git commit locally:
git log --oneline
git revert [commit-hash]
git push origin main
```

---

## Troubleshooting

### Database Connection Error
```bash
# Check DATABASE_URL is correctly set
echo $env:DATABASE_URL  # PowerShell
env | grep DATABASE_URL  # Linux/Mac

# Test connection
npm run prisma:db:execute --stdin < test.sql
```

### Build Fails on Vercel
1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Check for TypeScript errors locally
4. Run `npm run build` locally to debug

### 502/503 Errors
1. Check database is accessible
2. Verify DATABASE_URL is correct
3. Check server logs in Vercel
4. Restart deployment

### Slow Performance
1. Enable Vercel Analytics
2. Review Next.js performance recommendations
3. Optimize database queries
4. Consider edge caching

---

## Success Indicators

✅ All required environment variables set  
✅ Production build completes without errors  
✅ Database migrations applied successfully  
✅ HTTPS working correctly  
✅ Login/logout functionality works  
✅ API endpoints respond correctly  
✅ Error logging active  
✅ Security headers present in responses  
✅ No console errors in browser DevTools  
✅ Performance metrics acceptable  

---

**Last Updated**: 2026-05-25
**Version**: 1.0

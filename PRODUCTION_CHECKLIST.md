# Partrix Production Deployment Checklist

## Pre-Deployment (Local)

### Code Quality & Security
- [ ] Run `npm run production:verify` - passes without errors
- [ ] Run `npm run lint` - no linting errors
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] Review all uncommitted changes with `git status`
- [ ] No console.logs left in production code
- [ ] No hardcoded credentials or secrets
- [ ] All environment variables have sensible defaults

### Environment Setup
- [ ] `.env.local` has all required variables
- [ ] `JWT_SECRET` is at least 32 characters
- [ ] `DATABASE_URL` points to production database
- [ ] `NODE_ENV=production`
- [ ] `ALLOWED_ORIGIN` set to production domain

### Database
- [ ] Database migrations reviewed with `prisma migrate status`
- [ ] Backup created before migrations
- [ ] Test migrations locally: `npm run prisma:migrate:dev`
- [ ] Schema changes documented

### Build & Performance
- [ ] Local production build successful: `npm run build`
- [ ] Build output size reasonable (< 500MB)
- [ ] No warnings during build
- [ ] Images optimized with Next.js Image component
- [ ] CSS/JS minification working

---

## GitHub Preparation

### Repository Setup
- [ ] Git initialized: `git init`
- [ ] Remote added: `git remote add origin https://github.com/YOUR_USERNAME/Partrix.git`
- [ ] Main branch created: `git branch -M main`
- [ ] `.gitignore` properly configured
- [ ] No `.env` files committed (check with `git check-ignore .env`)

### Initial Commit
- [ ] All production files staged: `git add .`
- [ ] Clear commit message: `git commit -m "Initial commit: Partrix rental management system"`
- [ ] Commit ready to push

---

## GitHub Push

```bash
# Verify branch name
git branch

# Push to GitHub
git push -u origin main

# Verify push successful
git log --oneline | head -5
```

---

## Vercel Deployment

### Create Vercel Project
- [ ] Vercel account created at https://vercel.com
- [ ] GitHub connected to Vercel
- [ ] Partrix repository imported
- [ ] Deployment initiated automatically

### Environment Variables in Vercel
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - 32+ character random string
- [ ] `NODE_ENV` - set to `production`
- [ ] `ALLOWED_ORIGIN` - your production domain
- [ ] `NEXT_PUBLIC_API_URL` - your production domain
- [ ] All other variables from `.env.example`
- [ ] Variables marked as sensitive where appropriate

### Database Configuration
- [ ] PostgreSQL database created (Vercel Postgres, Supabase, or Neon)
- [ ] Connection string added to Vercel
- [ ] Database verified accessible from Vercel
- [ ] Migrations automatically applied on deploy

### First Deployment
- [ ] Deployment completes without errors
- [ ] Build logs reviewed for warnings
- [ ] Deployment logs show migrations completed
- [ ] Production URL accessible

---

## Post-Deployment Verification

### Functionality Tests
- [ ] Visit production URL
- [ ] Login page loads
- [ ] Create test account
- [ ] Login with test account succeeds
- [ ] Dashboard loads correctly
- [ ] Navigation works
- [ ] API endpoints respond

### Security Verification
- [ ] HTTPS enabled and working
- [ ] Security headers present in response:
  - `Strict-Transport-Security`
  - `X-Frame-Options: DENY`
  - `Content-Security-Policy`
- [ ] No sensitive data in error messages
- [ ] CORS headers correct

### Performance & Monitoring
- [ ] Vercel Analytics enabled
- [ ] Performance metrics accessible
- [ ] Error tracking active
- [ ] Logs visible in Vercel dashboard
- [ ] Response times acceptable (< 1 second for most endpoints)

### Database & Data
- [ ] Database connection working
- [ ] Data accessible from API
- [ ] Migrations applied successfully
- [ ] Backups configured

---

## Monitoring Setup

### Real-Time Alerts
- [ ] Set up alerts for deployment failures
- [ ] Set up alerts for high error rates
- [ ] Set up alerts for 5xx errors
- [ ] Configure notification channel (email, Slack, etc.)

### Logging & Analytics
- [ ] Error logs configured
- [ ] Access logs enabled
- [ ] Analytics dashboard reviewed
- [ ] Custom metrics added

---

## Domain Configuration (Optional)

If using custom domain:
- [ ] Add domain in Vercel dashboard
- [ ] Update DNS records at registrar
- [ ] Wait for DNS propagation (5-30 minutes)
- [ ] Test custom domain works
- [ ] SSL certificate auto-issued

---

## Documentation Updates

- [ ] DEPLOYMENT.md reviewed and accurate
- [ ] README.md updated with production URL
- [ ] API documentation current
- [ ] Team notified of production URL

---

## Success Criteria

✅ **All the following are true:**
- Production build successful
- All environment variables configured
- Database working correctly
- Login/authentication working
- No error logs (or only expected errors)
- Response times acceptable
- HTTPS working
- Security headers present
- Team has access
- Monitoring/alerts active
- Backup strategy in place

---

## Rollback Plan

If issues occur:
1. Revert git commit: `git revert HEAD && git push origin main`
2. Or rollback in Vercel dashboard to previous deployment
3. Restore database from backup if needed

---

**Last Updated**: 2026-05-25
**Checklist Version**: 1.0

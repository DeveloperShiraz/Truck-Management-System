# 🚀 Deployment Guide

Complete guide to deploy the Truck Management System to Netlify.

## Prerequisites

- GitHub account
- Netlify account (free tier works)
- DeepSeek API key

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit: Truck Management System"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `truck-management-system`)
3. Don't initialize with README (we already have one)

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/truck-management-system.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Netlify

### 2.1 Connect Repository

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Authorize Netlify to access your repositories
5. Select your `truck-management-system` repository

### 2.2 Configure Build Settings

Netlify should auto-detect Next.js settings, but verify:

- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Functions directory:** (leave empty)

Click "Deploy site"

### 2.3 Set Environment Variables

**IMPORTANT:** Do this before your site goes live!

1. Go to Site settings → Environment variables
2. Click "Add a variable"
3. Add each of these:

```
Variable: NEXTAUTH_SECRET
Value: [Generate new secret - see below]

Variable: NEXTAUTH_URL
Value: https://your-site-name.netlify.app

Variable: DEEPSEEK_API_KEY
Value: [Your DeepSeek API key]

Variable: NODE_ENV
Value: production
```

### 2.4 Generate Production Secret

**On Linux/Mac:**
```bash
openssl rand -base64 32
```

**On Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Online:**
Go to https://generate-secret.vercel.app/32

**⚠️ IMPORTANT:** Use a different secret for production than development!

### 2.5 Update NEXTAUTH_URL

After deployment, Netlify assigns a URL like `https://your-site-name.netlify.app`

1. Copy your site URL
2. Go to Site settings → Environment variables
3. Update `NEXTAUTH_URL` with your actual URL
4. Click "Save"

### 2.6 Trigger Redeploy

1. Go to Deploys tab
2. Click "Trigger deploy" → "Deploy site"
3. Wait for deployment to complete

## Step 3: Verify Deployment

### 3.1 Check Site Status

1. Go to your site URL
2. You should see the login page
3. Try registering a new account
4. Try logging in

### 3.2 Test Features

- ✅ Registration works
- ✅ Login works
- ✅ Dashboard loads
- ✅ Profile page works
- ✅ Fleet management (for owners)
- ✅ Chatbot responds

### 3.3 Check Logs

If something doesn't work:

1. Go to Netlify dashboard
2. Click on your site
3. Go to "Functions" tab
4. Check function logs for errors

## Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `tms.yourdomain.com`)
4. Follow DNS configuration instructions

### 4.2 Update Environment Variables

After adding custom domain:

1. Go to Site settings → Environment variables
2. Update `NEXTAUTH_URL` to your custom domain
3. Trigger redeploy

### 4.3 Enable HTTPS

Netlify automatically provisions SSL certificates. Just wait a few minutes.

## Step 5: Continuous Deployment

### 5.1 Automatic Deploys

Every time you push to GitHub, Netlify automatically:
1. Pulls latest code
2. Runs build
3. Deploys if successful

### 5.2 Deploy Previews

For pull requests, Netlify creates preview deployments:
1. Create a branch
2. Make changes
3. Open pull request
4. Netlify comments with preview URL

## Troubleshooting

### Build Fails

**Error:** "Module not found"
- **Solution:** Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error:** "Environment variable not set"
- **Solution:** Check all environment variables are set in Netlify

### Site Loads but Features Don't Work

**Issue:** Can't login after registration
- **Solution:** Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set correctly

**Issue:** Chatbot doesn't respond
- **Solution:** Verify `DEEPSEEK_API_KEY` is valid and has credits

**Issue:** "Invalid session"
- **Solution:** Make sure `NEXTAUTH_URL` matches your actual site URL (including https://)

### Data Not Persisting

**Issue:** Users disappear after redeploy
- **Solution:** This is expected with file-based storage on Netlify
- **Future:** Migrate to AWS DynamoDB for persistence

## Monitoring

### Check Site Health

1. Go to Netlify dashboard
2. View "Analytics" tab
3. Monitor:
   - Page views
   - Bandwidth usage
   - Function invocations

### View Logs

1. Go to "Functions" tab
2. Click on any function
3. View real-time logs

### Set Up Alerts

1. Go to Site settings → Notifications
2. Add email notifications for:
   - Deploy failed
   - Deploy succeeded
   - Form submissions

## Updating Your Site

### Deploy New Changes

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main
```

Netlify automatically deploys!

### Rollback to Previous Version

1. Go to Deploys tab
2. Find the working deployment
3. Click "..." → "Publish deploy"

## Security Checklist

- ✅ `NEXTAUTH_SECRET` is unique and secure
- ✅ `NEXTAUTH_URL` matches your site URL
- ✅ `.env` file is in `.gitignore`
- ✅ No secrets committed to GitHub
- ✅ HTTPS is enabled
- ✅ Environment variables set in Netlify only

## Performance Optimization

### Enable Caching

Netlify automatically caches static assets. No configuration needed!

### Monitor Performance

1. Use Lighthouse in Chrome DevTools
2. Check Core Web Vitals
3. Optimize images if needed

### CDN

Netlify automatically serves your site from their global CDN.

## Cost Estimation

### Netlify Free Tier Includes:
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- HTTPS included
- CDN included

### DeepSeek API Costs:
- Check current pricing at https://platform.deepseek.com/pricing
- Monitor usage in DeepSeek dashboard

## Next Steps

1. ✅ Site is deployed
2. ✅ Environment variables configured
3. ✅ Custom domain added (optional)
4. ✅ Monitoring set up

### Future Enhancements:
- Migrate to AWS DynamoDB for data persistence
- Add AWS IoT for real-time telemetrics
- Implement email notifications
- Add analytics dashboard

## Support

- **Netlify Docs:** https://docs.netlify.com
- **Next.js Docs:** https://nextjs.org/docs
- **Project Issues:** Open an issue on GitHub

---

🎉 Congratulations! Your Truck Management System is now live!

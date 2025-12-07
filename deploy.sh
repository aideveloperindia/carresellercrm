#!/bin/bash
set -e

cd /Users/nandagiriaditya/Documents/carresellercrm

echo "🚀 Starting deployment process..."
echo ""

# Git setup
echo "📦 Setting up Git..."
git init
git remote add origin https://github.com/aideveloperindia/carresellercrm.git 2>/dev/null || git remote set-url origin https://github.com/aideveloperindia/carresellercrm.git

echo "✅ Git remote configured"
echo ""

# Add and commit
echo "📝 Adding files..."
git add -A

echo "💾 Committing changes..."
git commit -m "feat: Complete Car Reseller CRM with modern UI

- Fixed Tailwind configuration and styling issues
- Added modern UI/UX with gradients and responsive design
- Implemented automatic car creation when seller adds car details
- Added car brand/model/year dropdowns with Indian market data
- Enhanced Leads page with buyer/car dropdowns
- Improved error handling and user feedback
- Connected to MongoDB Atlas database
- Added default admin user (admin@carresellercrm.com / admin123)
- Streamlined workflow: seller → auto car → leads
- All pages now have consistent modern design" || echo "No changes to commit"

echo "✅ Changes committed"
echo ""

# Set branch and push
echo "🌿 Setting main branch..."
git branch -M main

echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo "✅ Pushed to GitHub successfully!"
echo ""

# Vercel deployment
echo "🚀 Deploying to Vercel..."
cd apps/web

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🌐 Deploying to production..."
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo "🎉 Your Car Reseller CRM is now live!"




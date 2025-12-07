#!/bin/bash
cd /Users/nandagiriaditya/Documents/carresellercrm

echo "=== Git Status ==="
git status

echo ""
echo "=== Adding all files ==="
git add -A

echo ""
echo "=== Committing changes ==="
git commit -m "feat: Complete Car Reseller CRM with modern UI, auto car creation, and dropdowns

- Fixed Tailwind configuration and styling issues
- Added modern UI/UX with gradients and responsive design
- Implemented automatic car creation when seller adds car details
- Added car brand/model/year dropdowns with Indian market data
- Enhanced Leads page with buyer/car dropdowns
- Improved error handling and user feedback
- Connected to MongoDB Atlas database
- Added default admin user (admin@carresellercrm.com / admin123)
- Streamlined workflow: seller → auto car → leads
- All pages now have consistent modern design"

echo ""
echo "=== Setting main branch ==="
git branch -M main

echo ""
echo "=== Pushing to remote ==="
git push -u origin main

echo ""
echo "=== Done! ==="




@echo off
echo 🚀 Pushing to GitHub...

git add .
git commit -m "Update: DIU Buy & Sell Marketplace"
git push origin main

echo ✅ Code pushed to GitHub!
echo 📍 Visit your repository to continue with Vercel deployment
pause 
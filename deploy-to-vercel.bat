@echo off
echo 🚀 DIU BUY & SELL - Vercel Deployment Guide
echo ============================================

echo.
echo 📋 Follow these steps to deploy to Vercel:
echo.
echo 1. Go to https://vercel.com
echo 2. Sign in with GitHub
echo 3. Click "New Project"
echo 4. Import your diu-buy-sell repository
echo 5. Configure:
echo    - Framework Preset: Next.js
echo    - Root Directory: ./
echo    - Build Command: yarn build
echo    - Output Directory: .next
echo    - Install Command: yarn install
echo 6. Click "Deploy"
echo.
echo 📍 After deployment, add environment variables:
echo    - NEXT_PUBLIC_SUPABASE_URL
echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo    - SUPABASE_SERVICE_ROLE_KEY
echo    - OPENAI_API_KEY
echo    - NEXT_PUBLIC_APP_URL
echo.
echo 🎯 Your app will be live at: https://your-project.vercel.app
echo.

pause 
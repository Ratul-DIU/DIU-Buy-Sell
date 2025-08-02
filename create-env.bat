@echo off
echo 🔧 Creating Environment File...
echo.

echo # DIU BUY & SELL - Environment Variables > .env.local
echo # Replace these with your actual Supabase credentials >> .env.local
echo. >> .env.local
echo # Supabase Configuration (Required) >> .env.local
echo NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co >> .env.local
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here >> .env.local
echo SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here >> .env.local
echo. >> .env.local
echo # OpenAI Configuration (Optional) >> .env.local
echo OPENAI_API_KEY=your_openai_api_key_here >> .env.local
echo. >> .env.local
echo # App Configuration >> .env.local
echo NEXT_PUBLIC_APP_URL=http://localhost:3000 >> .env.local

echo ✅ Environment file created: .env.local
echo.
echo 📋 Next steps:
echo 1. Set up Supabase project
echo 2. Update .env.local with your actual credentials
echo 3. Restart development server
echo.
echo 📖 Follow UI_FIX_GUIDE.md for complete instructions
echo.

pause 
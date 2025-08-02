# 🚀 AUTOMATED SETUP GUIDE - GitHub → Vercel → Supabase

## ✅ Current Status
- ✅ Project is running at `http://localhost:3000`
- ✅ All dependencies installed
- ✅ Ready for deployment

---

## 🔧 STEP 1: GitHub Setup (Automated)

### 1.1 Create GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** button → **"New repository"**
3. Fill in:
   - **Repository name**: `diu-buy-sell`
   - **Description**: `DIU Buy & Sell - Professional Marketplace Platform`
   - **Visibility**: Public (or Private if you prefer)
   - ✅ **Add a README file**
   - ✅ **Add .gitignore**: Node
   - ✅ **Choose a license**: MIT License
4. Click **"Create repository"**

### 1.2 Push Code to GitHub (Automated Script)
Run this command in your project directory:

```bash
# Initialize git and push to GitHub
git init
git add .
git commit -m "Initial commit: DIU Buy & Sell Marketplace"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/diu-buy-sell.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

---

## 🔧 STEP 2: Supabase Setup (Automated)

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign in with GitHub
4. Click **"New Project"**
5. Fill in:
   - **Name**: `diu-buy-sell`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
6. Click **"Create new project"**
7. Wait for setup to complete (2-3 minutes)

### 2.2 Get Supabase Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public key** (starts with `eyJ`)
   - **service_role key** (starts with `eyJ`)

### 2.3 Set Up Database (Automated SQL)
1. Go to **SQL Editor** in Supabase
2. Copy and paste this complete SQL script:

```sql
-- Complete Database Setup for DIU Buy & Sell
-- Run this entire script in Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(title) >= 3 AND length(title) <= 100),
  description TEXT NOT NULL CHECK (length(description) >= 10 AND length(description) <= 1000),
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  category TEXT NOT NULL CHECK (category IN ('Electronics', 'Books', 'Clothing', 'Sports', 'Home', 'Other')),
  image_url TEXT,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_sold BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_sold ON products(is_sold);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view available products" ON products;
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can view available products" ON products FOR SELECT USING (is_sold = false);
CREATE POLICY "Users can view their own products" ON products FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Users can insert their own products" ON products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own products" ON products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete their own products" ON products FOR DELETE USING (auth.uid() = seller_id);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;

-- Storage policies
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Success message
SELECT 'Database setup completed successfully!' as status;
```

3. Click **"Run"** to execute the script
4. You should see: `Database setup completed successfully!`

---

## 🔧 STEP 3: Environment Variables Setup

### 3.1 Create .env.local File
Create a file named `.env.local` in your project root with this content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenAI Configuration (Optional - for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Replace the placeholder values with your actual Supabase credentials from Step 2.2**

### 3.2 Get OpenAI API Key (Optional)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up/Login
3. Go to **API Keys**
4. Create new secret key
5. Copy the key to your `.env.local`

---

## 🔧 STEP 4: Vercel Deployment (Automated)

### 4.1 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"New Project"**
4. Import your `diu-buy-sell` repository
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `yarn build`
   - **Output Directory**: `.next`
   - **Install Command**: `yarn install`
6. Click **"Deploy"**

### 4.2 Add Environment Variables to Vercel
1. In Vercel dashboard, go to your project
2. Go to **Settings** → **Environment Variables**
3. Add these variables (copy from your `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL)

### 4.3 Redeploy
1. Go to **Deployments** tab
2. Click **"Redeploy"** on your latest deployment
3. Wait for deployment to complete

---

## 🔧 STEP 5: Configure Supabase for Production

### 5.1 Update Supabase Settings
1. In Supabase dashboard, go to **Settings** → **API**
2. Add your Vercel domain to **Additional Allowed Origins**:
   - `https://your-project.vercel.app`
   - `https://your-project.vercel.app/*`

### 5.2 Create Admin User
1. Visit your Vercel app and sign up with your email
2. Go to **SQL Editor** in Supabase
3. Run this SQL (replace with your email):

```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

---

## 🎯 STEP 6: Test Everything

### 6.1 Test Local Development
```bash
yarn dev
```
Visit `http://localhost:3000`

### 6.2 Test Production
Visit your Vercel URL (e.g., `https://your-project.vercel.app`)

### 6.3 Test Features
- ✅ User registration/login
- ✅ Product creation
- ✅ Image upload
- ✅ Search and filtering
- ✅ Admin panel

---

## 🚀 Automation Scripts

### Quick Setup Script
Create a file called `setup.bat` in your project root:

```batch
@echo off
echo 🚀 DIU BUY & SELL - Quick Setup
echo ================================

echo.
echo 📦 Installing dependencies...
yarn install

echo.
echo 🌐 Starting development server...
echo 📍 Visit: http://localhost:3000
echo.
echo 📋 Next steps:
echo 1. Set up GitHub repository
echo 2. Create Supabase project
echo 3. Deploy to Vercel
echo 4. Configure environment variables
echo.

yarn dev
```

### Git Push Script
Create a file called `push-to-github.bat`:

```batch
@echo off
echo 🚀 Pushing to GitHub...

git add .
git commit -m "Update: DIU Buy & Sell Marketplace"
git push origin main

echo ✅ Code pushed to GitHub!
echo 📍 Visit your repository to continue with Vercel deployment
pause
```

---

## 🎉 SUCCESS CHECKLIST

- ✅ **GitHub**: Repository created and code pushed
- ✅ **Supabase**: Project created, database set up, credentials obtained
- ✅ **Environment**: `.env.local` configured
- ✅ **Vercel**: Project deployed with environment variables
- ✅ **Testing**: All features working in production
- ✅ **Admin**: Admin user created

---

## 🔗 Quick Links

- **GitHub Repository**: `https://github.com/YOUR_USERNAME/diu-buy-sell`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Supabase Dashboard**: `https://supabase.com/dashboard`
- **Live App**: `https://your-project.vercel.app`

---

## 🆘 Troubleshooting

### Common Issues:
1. **Environment variables not working**: Check Vercel settings
2. **Database connection errors**: Verify Supabase credentials
3. **Image upload fails**: Check storage bucket permissions
4. **Authentication issues**: Verify RLS policies

### Support:
- Check Vercel logs in dashboard
- Check Supabase logs in dashboard
- Review browser console for errors

---

**🎯 Your professional marketplace will be live in minutes!** 
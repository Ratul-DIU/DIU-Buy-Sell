# DIU BUY & SELL - Setup Guide

## 🚀 Quick Start

This guide will help you set up the DIU BUY & SELL application with Supabase backend.

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free at [supabase.com](https://supabase.com))
- An OpenAI API key (optional, for AI features)

## 🔧 Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `diu-buy-sell` (or any name you prefer)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your location
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

### 1.2 Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## 🔧 Step 2: Environment Variables

### 2.1 Create .env.local File

Create a file named `.env.local` in your project root with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenAI Configuration (Optional)
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 2.2 Replace Placeholder Values

Replace the placeholder values with your actual credentials:

- `your_supabase_project_url_here` → Your Supabase Project URL
- `your_supabase_anon_key_here` → Your Supabase anon public key
- `your_supabase_service_role_key_here` → Your Supabase service role key (from Settings → API)
- `your_openai_api_key_here` → Your OpenAI API key (optional)

## 🔧 Step 3: Database Setup

### 3.1 Create Database Tables

In your Supabase dashboard, go to **SQL Editor** and run the following SQL:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'banned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_sold BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for products
CREATE POLICY "Anyone can view available products" ON products
  FOR SELECT USING (is_sold = FALSE);

CREATE POLICY "Users can view their own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 3.2 Create Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Name it `product-images`
4. Set it as **Public**
5. Click **Create bucket**

### 3.3 Storage Policies

Run this SQL in the SQL Editor:

```sql
-- Allow public access to product images
CREATE POLICY "Public access to product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own images
CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 🔧 Step 4: Restart Development Server

1. Stop your development server (Ctrl+C)
2. Run: `yarn dev`
3. The application should now work with authentication!

## 🧪 Testing the Setup

1. Visit `http://localhost:3001`
2. Click "Sign In" in the navigation
3. Click "Sign up" to create an account
4. Try posting a product
5. Test the search and filter features

## 🔧 Step 5: OpenAI Setup (Optional)

For AI-powered product title and category suggestions:

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Add it to your `.env.local` file
3. The AI features will automatically work

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## 🆘 Troubleshooting

### Common Issues

1. **"Supabase is not configured"**
   - Check that `.env.local` exists and has correct values
   - Restart the development server

2. **"Invalid API key"**
   - Verify your Supabase URL and anon key are correct
   - Check that you copied the full keys

3. **"Table does not exist"**
   - Run the SQL commands in Step 3.1
   - Check that RLS policies are created

4. **"Image upload failed"**
   - Create the storage bucket as described in Step 3.2
   - Run the storage policies SQL

### Getting Help

- Check the browser console for error messages
- Verify all environment variables are set correctly
- Ensure Supabase project is active and not paused

## 📝 Next Steps

- Customize the UI colors and branding
- Add more product categories
- Implement real-time notifications
- Add payment integration
- Set up email notifications

---

**Need help?** Check the [README.md](README.md) for more detailed information about the application features and architecture. 
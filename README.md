# DIU BUY & SELL - Campus Exchange Platform

A full-stack web application for buying and selling items within the DIU campus community. Built with Next.js 14, Supabase, and OpenAI integration.

## 🚀 Features

- **User Authentication**: Email/password signup and login with Supabase
- **Product Listings**: Create, view, and manage product listings
- **AI Enhancement**: OpenAI-powered title and category suggestions
- **Image Upload**: Supabase Storage for product images
- **Search & Filter**: Advanced search and category filtering
- **User Dashboard**: Manage your own listings
- **Admin Panel**: Full admin control for managing users and products
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark Mode**: Built-in dark/light theme support

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: OpenAI GPT-3.5 Turbo
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account
- An OpenAI API key
- Git installed

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd diu-buy-sell
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp env.local.example .env.local
```

Fill in your environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase Setup

#### Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

#### Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'banned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  is_sold BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Users can insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON products FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

#### Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `product-images`
3. Set the bucket to public
4. Add this storage policy:

```sql
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

### 5. OpenAI Setup

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account and get your API key
3. Add the API key to your `.env.local` file

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗 Project Structure

```
diu-buy-sell/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin panel
│   ├── post/              # Post product page
│   ├── product/           # Product detail pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx      # Auth context
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── navigation.tsx    # Navigation component
├── lib/                  # Utility functions
└── public/               # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to add these to your Vercel environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## 👥 User Roles

- **User**: Can post items, manage their listings
- **Admin**: Can manage all products and users, ban users
- **Banned**: Cannot post or interact with the platform

## 🔐 Security Features

- Row Level Security (RLS) on all tables
- User authentication required for protected routes
- Admin-only access to admin panel
- Secure image upload with Supabase Storage
- Input validation and sanitization

## 🎨 Customization

### Styling

The app uses Tailwind CSS with a custom color scheme. You can modify:

- `tailwind.config.js` - Theme configuration
- `app/globals.css` - Global styles and custom components

### Categories

To add new product categories, update:

1. The categories array in relevant components
2. The AI prompt in `app/api/generate/route.ts`
3. The database validation (if using CHECK constraints)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify your environment variables are correct
3. Ensure Supabase tables and policies are set up correctly
4. Check that your OpenAI API key is valid

## 🎯 Roadmap

- [ ] Real-time messaging between buyers and sellers
- [ ] Product reviews and ratings
- [ ] Advanced search filters
- [ ] Email notifications
- [ ] Mobile app version
- [ ] Payment integration
- [ ] Product categories management
- [ ] User profiles with avatars
- [ ] Product image gallery
- [ ] Social sharing features

---

Built with ❤️ for the DIU campus community 
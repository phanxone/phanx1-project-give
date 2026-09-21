-- ============================================================
-- SUPABASE DATABASE SETUP FOR REWARDS & ITEM EXCHANGE APP
-- ============================================================

-- 1. ตาราง profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    points INTEGER DEFAULT 500 NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ตาราง items
CREATE TABLE IF NOT EXISTS public.items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    points INTEGER NOT NULL DEFAULT 100,
    stock INTEGER NOT NULL DEFAULT 10,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ตาราง orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
    item_title TEXT NOT NULL,
    points_spent INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ตาราง banners สำหรับรูปสไลด์แบนเนอร์หน้าแรก
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ตาราง categories สำหรับหมวดหมู่สินค้าและแมพต่างๆ
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- เพิ่มคอลัมน์ category_id ในตาราง items
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS category_name TEXT;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Items viewable" ON public.items FOR SELECT USING (true);
CREATE POLICY "Items manageable" ON public.items FOR ALL USING (true);
CREATE POLICY "Orders viewable" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Orders insertable" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders manageable" ON public.orders FOR ALL USING (true);
CREATE POLICY "Banners viewable" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Banners manageable" ON public.banners FOR ALL USING (true);
CREATE POLICY "Categories viewable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories manageable" ON public.categories FOR ALL USING (true);

-- Trigger Profile Auto-creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, username, avatar_url, points)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url',
        500
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

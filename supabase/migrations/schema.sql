-- DISABLE ALL AUTH DEPENDENCIES FOR SIMPLE USERNAME/PASSWORD LOGIN
-- 1. Matikan RLS atau buka aksesnya karena kita tidak pakai Supabase Auth (auth.uid() akan null)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE sellers DISABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_status DISABLE ROW LEVEL SECURITY;

-- 2. Pastikan tabel Profiles punya struktur yang benar
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID, -- Tetap ada tapi tidak wajib
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    is_blocked BOOLEAN DEFAULT FALSE,
    can_view_tiktok BOOLEAN DEFAULT TRUE,
    can_view_instagram BOOLEAN DEFAULT FALSE,
    can_view_twitter BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Pastikan Akun Admin Terdaftar
INSERT INTO profiles (username, password, role)
VALUES ('admin', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 4. Pastikan tabel lain ada
CREATE TABLE IF NOT EXISTS system_status (id TEXT PRIMARY KEY, last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(), status TEXT);
CREATE TABLE IF NOT EXISTS search_queries (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, query TEXT NOT NULL UNIQUE, status TEXT DEFAULT 'pending', created_at TIMESTAMP DEFAULT NOW());

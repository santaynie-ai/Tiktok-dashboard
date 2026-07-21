-- 1. Matikan RLS agar Dashboard & Scraper bisa beroperasi dengan mudah (Service Role Bypass)
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sellers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS search_queries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS system_status DISABLE ROW LEVEL SECURITY;

-- 2. Tabel Profiles (User Management)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    is_blocked BOOLEAN DEFAULT FALSE,
    can_view_tiktok BOOLEAN DEFAULT TRUE,
    can_view_instagram BOOLEAN DEFAULT FALSE,
    can_view_twitter BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Sellers (Data TikTok UMKM)
CREATE TABLE IF NOT EXISTS sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT DEFAULT 'tiktok',
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    followers_count BIGINT DEFAULT 0,
    phone_number TEXT,
    category TEXT,
    province TEXT DEFAULT 'Indonesia',
    city TEXT DEFAULT 'Indonesia',
    district TEXT, -- Kecamatan
    subdistrict TEXT, -- Kelurahan
    potential_score INTEGER DEFAULT 0,
    potential_reason TEXT,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    is_viral BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    tiktok_url TEXT,
    last_scraped TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Search Queries (Queue Scraper)
CREATE TABLE IF NOT EXISTS search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, stopped
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel System Status (Heartbeat Worker)
CREATE TABLE IF NOT EXISTS system_status (
    id TEXT PRIMARY KEY,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT
);

-- 6. Akun Admin Default
INSERT INTO profiles (username, password, role)
VALUES ('admin', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 7. Indexing untuk Pencarian Cepat
CREATE INDEX IF NOT EXISTS idx_sellers_city ON sellers(city);
CREATE INDEX IF NOT EXISTS idx_sellers_category ON sellers(category);
CREATE INDEX IF NOT EXISTS idx_sellers_username ON sellers(username);

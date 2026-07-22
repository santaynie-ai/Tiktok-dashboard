-- 1. Matikan RLS agar Dashboard & Scraper bisa beroperasi dengan mudah
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sellers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS search_queries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS system_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS login_requests DISABLE ROW LEVEL SECURITY;

-- 2. Tabel Profiles (User Management)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 3. Tabel Sellers (Data TikTok UMKM) - DIOPTIMALKAN
DROP TABLE IF EXISTS sellers;
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT DEFAULT 'tiktok',
    username TEXT UNIQUE NOT NULL,
    display_name TEXT DEFAULT '',
    bio TEXT NOT NULL,
    followers_count BIGINT DEFAULT 0,
    phone_number TEXT DEFAULT 'N/A',
    category TEXT DEFAULT 'General',
    province TEXT DEFAULT '',
    city TEXT DEFAULT '',
    district TEXT DEFAULT '',
    potential_score INTEGER DEFAULT 0,
    potential_reason TEXT DEFAULT 'Analisis sedang diproses oleh AI',
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    tiktok_url TEXT DEFAULT '',
    last_scraped TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Search Queries
CREATE TABLE IF NOT EXISTS search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel System Status
CREATE TABLE IF NOT EXISTS system_status (
    id TEXT PRIMARY KEY,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT
);

-- 6. Tabel Login Requests (Untuk 2FA/Approval Admin)
CREATE TABLE IF NOT EXISTS login_requests (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Akun Admin Default
INSERT INTO profiles (username, password, role)
VALUES ('admin', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 8. Indexing
CREATE INDEX IF NOT EXISTS idx_sellers_city ON sellers(city);
CREATE INDEX IF NOT EXISTS idx_sellers_category ON sellers(category);
CREATE INDEX IF NOT EXISTS idx_sellers_district ON sellers(district);

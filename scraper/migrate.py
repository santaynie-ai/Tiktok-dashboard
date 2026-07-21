import os
import psycopg2
from dotenv import load_dotenv

# Load env from frontend/.env
env_path = os.path.join(os.path.dirname(__file__), '../frontend/.env')
load_dotenv(env_path)

def run_migration():
    # Database configuration
    db_password = os.getenv('Password_supabase')
    db_host = "db.rmyigajrfuffjlosbgdd.supabase.co"
    db_name = "postgres"
    db_user = "postgres"
    db_port = "5432"

    if not db_password:
        print("❌ Error: Password_supabase not found in .env")
        return

    # Full Schema for current Dashboard features
    sql_commands = """
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

    -- 3. Tabel Sellers (Data TikTok UMKM)
    CREATE TABLE IF NOT EXISTS sellers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        platform TEXT DEFAULT 'tiktok',
        username TEXT UNIQUE NOT NULL,
        display_name TEXT,
        bio TEXT,
        followers_count BIGINT DEFAULT 0,
        phone_number TEXT,
        category TEXT,
        province TEXT DEFAULT 'Indonesia',
        city TEXT DEFAULT 'Indonesia',
        district TEXT,
        subdistrict TEXT,
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

    -- 6. Tabel Login Requests (2FA via WhatsApp) - Gunakan ID BIGINT agar mudah diketik di WA
    -- Kita drop dulu jika sudah ada UUID agar ganti ke BIGINT
    DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'login_requests') THEN
            -- Check if column id is UUID
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'login_requests' AND column_name = 'id') = 'uuid' THEN
                DROP TABLE login_requests;
            END IF;
        END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS login_requests (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        username TEXT NOT NULL,
        status TEXT DEFAULT 'pending', -- pending, approved, rejected
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE IF EXISTS login_requests DISABLE ROW LEVEL SECURITY;

    -- 7. Akun Admin Default
    INSERT INTO profiles (username, password, role)
    VALUES ('admin', 'admin123', 'admin')
    ON CONFLICT (username) DO NOTHING;

    -- 8. Indexing
    CREATE INDEX IF NOT EXISTS idx_sellers_city ON sellers(city);
    CREATE INDEX IF NOT EXISTS idx_sellers_category ON sellers(category);
    """

    try:
        print(f"Connecting to Supabase Database...")
        conn = psycopg2.connect(
            dbname=db_name,
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port,
            connect_timeout=15
        )
        conn.autocommit = True
        cur = conn.cursor()

        print("🔄 Syncing Tables with Frontend Features...")
        cur.execute(sql_commands)

        print("✅ Supabase Tables Updated Successfully!")

        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Migration Failed: {e}")

if __name__ == "__main__":
    run_migration()

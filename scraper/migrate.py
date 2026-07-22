import os
import psycopg2
from dotenv import load_dotenv

# Load env from frontend/.env
env_path = os.path.join(os.path.dirname(__file__), '../frontend/.env')
load_dotenv(env_path)

def run_migration():
    # Database configuration
    db_password = os.getenv('PASSWORD_SUPABASE') or os.getenv('Password_supabase')
    db_host = "db.rmyigajrfuffjlosbgdd.supabase.co"
    db_name = "postgres"
    db_user = "postgres"
    db_port = "5432"

    if not db_password:
        print("❌ Error: PASSWORD_SUPABASE not found in .env")
        return

    sql_commands = """
    -- 1. Matikan RLS agar Dashboard & Scraper bisa beroperasi dengan mudah
    ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS sellers DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS search_queries DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS system_status DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS login_requests DISABLE ROW LEVEL SECURITY;

    -- 2. Update Sellers Table with Location Fields
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='sellers' AND column_name='province') THEN
            ALTER TABLE sellers ADD COLUMN province TEXT DEFAULT '';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='sellers' AND column_name='district') THEN
            ALTER TABLE sellers ADD COLUMN district TEXT DEFAULT '';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='sellers' AND column_name='city') THEN
            ALTER TABLE sellers ADD COLUMN city TEXT DEFAULT '';
        END IF;
    END $$;

    -- 3. Akun Admin Default
    INSERT INTO profiles (username, password, role)
    VALUES ('admin', 'admin123', 'admin')
    ON CONFLICT (username) DO NOTHING;

    -- 4. Indexing for performance
    CREATE INDEX IF NOT EXISTS idx_sellers_city ON sellers(city);
    CREATE INDEX IF NOT EXISTS idx_sellers_category ON sellers(category);
    CREATE INDEX IF NOT EXISTS idx_sellers_district ON sellers(district);
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

        print("🔄 Syncing Tables with New Location Features...")
        cur.execute(sql_commands)

        print("✅ Supabase Tables Updated Successfully!")

        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Migration Failed: {e}")

if __name__ == "__main__":
    run_migration()

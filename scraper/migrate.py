import os
import psycopg2
from dotenv import load_dotenv

# Load env from frontend/.env
env_path = os.path.join(os.path.dirname(__file__), '../frontend/.env')
load_dotenv(env_path)

def run_migration():
    # Database configuration
    db_password = os.getenv('Password_supabase')
    # Using the project ref directly in host
    db_host = "db.rmyigajrfuffjlosbgdd.supabase.co"
    db_name = "postgres"
    db_user = "postgres"
    db_port = "5432"

    if not db_password:
        print("❌ Error: Password_supabase not found in .env")
        return

    # SQL for binding policy fix
    sql_commands = """
    -- 1. Pastikan RLS Aktif
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    -- 2. Hapus Policy Lama agar tidak duplikat
    DROP POLICY IF EXISTS "Profiles access" ON profiles;
    DROP POLICY IF EXISTS "Allow login" ON profiles;
    DROP POLICY IF EXISTS "Enable login for all" ON profiles;
    DROP POLICY IF EXISTS "Enable binding for login" ON profiles;
    DROP POLICY IF EXISTS "Admin full access" ON profiles;

    -- 3. Policy Baru: Izinkan SELECT untuk proses login (Berdasarkan Username & Password)
    CREATE POLICY "Enable login for all" ON profiles FOR SELECT USING (true);

    -- 4. Policy Baru: Izinkan UPDATE auth_id untuk proses binding pertama kali
    CREATE POLICY "Enable binding for login" ON profiles FOR UPDATE USING (auth_id IS NULL OR auth_id = auth.uid());

    -- 5. Policy Baru: Admin bisa melakukan segalanya
    CREATE POLICY "Admin full access" ON profiles FOR ALL
    USING ((SELECT role FROM profiles WHERE auth_id = auth.uid()) = 'admin');

    -- 6. Masukkan Default Admin jika belum ada
    INSERT INTO profiles (username, password, role)
    VALUES ('admin', 'admin123', 'admin')
    ON CONFLICT (username) DO NOTHING;
    """

    try:
        print(f"Connecting to Supabase (Host: {db_host})...")
        # Direct connection
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

        print("🔄 Applying Security Binding Policies...")
        cur.execute(sql_commands)

        print("✅ Migration Successful! Binding policies are now active.")

        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        print("\nPossible fix: If DNS fails, you might need to use the Supabase SQL Editor manually.")

if __name__ == "__main__":
    run_migration()

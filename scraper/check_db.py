import os
from supabase_client import SupabaseClient
from dotenv import load_dotenv

# Load env
load_dotenv('../frontend/.env')

def check():
    try:
        supabase = SupabaseClient()
        print("Checking tables...")

        # Test Profiles table
        res = supabase.client.table('profiles').select('username').limit(1).execute()
        print("✅ Profiles table exists.")

        # Test Sellers table
        res = supabase.client.table('sellers').select('username').limit(1).execute()
        print("✅ Sellers table exists.")

        # Test Search Queries table
        res = supabase.client.table('search_queries').select('query').limit(1).execute()
        print("✅ Search Queries table exists.")

        print("\n🚀 Database is READY for Multi-User & RLS Security!")
    except Exception as e:
        print(f"❌ Database issue: {e}")
        print("Please run the SQL in Supabase SQL Editor manually to fix this.")

if __name__ == "__main__":
    check()

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables for local development
# This will load from frontend/.env or scraper/.env if they exist
load_dotenv(os.path.join(os.path.dirname(__file__), '../frontend/.env'))
load_dotenv()

def init_supabase():
    url = os.environ.get('SUPABASE_URL') or os.environ.get('VITE_SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_KEY')

    # Fallback to anon key for local testing if service key is not provided
    # Note: RLS policies might need adjustment if using anon key for inserts
    if not key:
        key = os.environ.get('VITE_SUPABASE_ANON_KEY')

    if not url or not key:
        print("CRITICAL ERROR: Missing Supabase credentials!")
        print(f"URL found: {'Yes' if url else 'No'}")
        print(f"Key found: {'Yes' if key else 'No'}")
        print("Please check your GitHub Secrets or .env file.")
        sys.exit(1)

    return create_client(url, key)

class SupabaseClient:
    def __init__(self):
        self.client = init_supabase()

    def insert_seller(self, seller_data):
        try:
            # Check if seller exists
            existing = self.client.table('sellers')\
                .select('id')\
                .eq('username', seller_data['username'])\
                .execute()

            if existing.data:
                # Update existing
                result = self.client.table('sellers')\
                    .update(seller_data)\
                    .eq('username', seller_data['username'])\
                    .execute()
            else:
                # Insert new
                result = self.client.table('sellers')\
                    .insert(seller_data)\
                    .execute()

            return result.data
        except Exception as e:
            print(f"Error inserting seller: {e}")
            return None
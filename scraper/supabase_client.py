import os
from supabase import create_client, Client

def init_supabase():
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_KEY')
    if not url or not key:
        raise ValueError("Missing Supabase credentials")
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
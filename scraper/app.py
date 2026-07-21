import os
import re
import time
import requests
import random
from datetime import datetime
from playwright.sync_api import sync_playwright
from supabase_client import SupabaseClient

# Inisialisasi Supabase
SUPABASE = SupabaseClient()

class SyncScraper:
    def __init__(self):
        self.wa_url = os.environ.get('WA_API_URL')
        self.wa_id = os.environ.get('WA_INSTANCE_ID')
        self.wa_token = os.environ.get('WA_API_TOKEN')
        self.wa_group = os.environ.get('WA_GROUP_ID')

    def scrape_and_save(self, page, username, category="Search Result"):
        try:
            # CHECK DUPLICATE
            existing = SUPABASE.client.table('sellers').select('username').eq('username', username).execute()
            if existing.data:
                print(f"⏩ @{username} exists, skipping...")
                return False

            url = f"https://www.tiktok.com/@{username}"
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_selector('[data-e2e="user-title"]', timeout=15000)

            display_name = page.inner_text('[data-e2e="user-title"]')
            bio = page.inner_text('[data-e2e="user-bio"]') if page.query_selector('[data-e2e="user-bio"]') else ""

            if not bio.strip():
                print(f"⏩ @{username} has empty bio, skipping...")
                return False

            clean_bio = bio.replace(" ", "").replace("-", "")
            phone_match = re.search(r'(?:\+62|62|08)[0-9]{9,12}', clean_bio)
            phone = phone_match.group(0) if phone_match else None

            f_text = page.inner_text('[data-e2e="followers-count"]')
            followers = 0
            try:
                t = f_text.upper()
                if 'M' in t: followers = int(float(t.replace('M', '')) * 1000000)
                elif 'K' in t: followers = int(float(t.replace('K', '')) * 1000)
                else: followers = int(''.join(filter(str.isdigit, t)) or 0)
            except: pass

            data = {
                'platform': 'tiktok',
                'username': username,
                'display_name': display_name or username,
                'bio': bio,
                'followers_count': followers,
                'phone_number': phone or 'N/A',
                'category': category,
                'city': "Indonesia",
                'potential_score': int(min((followers / 5000) + (30 if phone else 0), 100)),
                'potential_reason': "Hasil pencarian manual.",
                'tiktok_url': url,
                'last_scraped': datetime.now().isoformat()
            }

            SUPABASE.client.table('sellers').upsert(data, on_conflict='username').execute()
            print(f"✅ Saved @{username}")
            return True
        except Exception as e:
            print(f"❌ Error @{username}: {str(e)[:30]}")
            return False

def run_local_search_worker():
    scraper = SyncScraper()
    with sync_playwright() as p:
        # Local: Menampilkan browser agar bisa dipantau
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        page = context.new_page()

        print("🚀 LOCAL SEARCH WORKER: Monitoring Dashboard Queue...")

        while True:
            try:
                # Update Heartbeat
                SUPABASE.client.table('system_status').upsert({'id': 'search_engine', 'last_seen': datetime.now().isoformat(), 'status': 'online'}).execute()

                # Cek Antrean dari Dashboard
                res = SUPABASE.client.table('search_queries').select('*').eq('status', 'pending').limit(1).execute()

                if res.data:
                    task = res.data[0]
                    tid, query = task['id'], task['query']
                    SUPABASE.client.table('search_queries').update({'status': 'processing'}).eq('id', tid).execute()

                    print(f"🔎 Processing Search Query: {query}")

                    if query.startswith('@'):
                        scraper.scrape_and_save(page, query.replace('@', ''))
                    else:
                        page.goto(f"https://www.tiktok.com/search/user?q={query}")
                        time.sleep(5)
                        links = page.query_selector_all('a[href*="/@"]')
                        for link in links[:10]:
                            href = link.get_attribute('href')
                            u = re.search(r'@([\w.]+)', href)
                            if u: scraper.scrape_and_save(page, u.group(1))
                            time.sleep(2)

                    SUPABASE.client.table('search_queries').update({'status': 'completed'}).eq('id', tid).execute()
                    print(f"🏁 Task {query} Finished.")

            except Exception as e:
                print(f"⚠️ Warning: {e}")

            time.sleep(10)

if __name__ == "__main__":
    run_local_search_worker()

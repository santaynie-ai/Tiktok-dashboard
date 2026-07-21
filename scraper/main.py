import asyncio
import os
import random
import re
import requests
import time
import sys
from datetime import datetime, timedelta
from playwright.async_api import async_playwright
from supabase_client import SupabaseClient
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../frontend/.env'))

CATEGORIES = [
    "Kuliner", "Fashion", "Beauty", "Skincare",
    "Gadget", "Elektronik", "Home Living", "Jasa"
]

class AcquisitionAIScraper:
    def __init__(self):
        self.supabase = SupabaseClient()
        self.user_data_dir = "/tmp/tiktok_data" if os.name != 'nt' else os.path.join(os.path.dirname(__file__), "user_data")
        self.wa_url = os.environ.get('WA_API_URL')
        self.wa_id = os.environ.get('WA_INSTANCE_ID')
        self.wa_token = os.environ.get('WA_API_TOKEN')
        self.wa_group = os.environ.get('WA_GROUP_ID')
        self.start_time = datetime.now()
        self.duration_limit = timedelta(hours=5, minutes=30)

    def log(self, msg):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

    def send_notification(self, data):
        if not all([self.wa_id, self.wa_token, self.wa_group]): return
        msg = (f"🚀 *ACQUISITION AI: NEW LEAD!*\n\n"
               f"👤 *{data['display_name']}* (@{data['username']})\n"
               f"📂 *Kategori:* {data['category']}\n"
               f"📊 *Followers:* {data['followers_count']:,}\n"
               f"📞 *WA:* {data['phone_number'] or 'Tidak ada'}\n"
               f"⚡ *Score:* {data['potential_score']}/100")
        try:
            requests.post(f"{self.wa_url}/waInstance{self.wa_id}/sendMessage/{self.wa_token}",
                          json={"chatId": self.wa_group, "message": msg})
        except: pass

    async def extract_profile(self, context, username, category="General"):
        # Check if already exists to avoid redundant scraping
        existing = self.supabase.client.table('sellers').select('username').eq('username', username).execute()
        if existing.data:
            self.log(f"⏩ Skipping @{username} (Already exists)")
            return

        page = await context.new_page()
        await page.set_extra_http_headers({"Accept-Language": "en-US,en;q=0.9"})

        try:
            self.log(f"🕵️  Scanning profile: @{username} [{category}]")
            await page.goto(f"https://www.tiktok.com/@{username}", wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_selector('[data-e2e="user-title"]', timeout=15000)

            display_name = await page.inner_text('[data-e2e="user-title"]')
            bio = await page.inner_text('[data-e2e="user-bio"]') if await page.query_selector('[data-e2e="user-bio"]') else ""

            phone_match = re.search(r'(?:\+62|62|08)[0-9]{9,12}', bio.replace(" ", "").replace("-", ""))
            phone = phone_match.group(0) if phone_match else None

            followers_raw = await page.inner_text('[data-e2e="followers-count"]')
            followers = self.parse_count(followers_raw)

            if followers < 100:
                await page.close()
                return

            data = {
                'platform': 'tiktok',
                'username': username,
                'display_name': display_name,
                'followers_count': followers,
                'phone_number': phone,
                'category': category,
                'city': "Indonesia",
                'potential_score': int(min((followers / 1000) + (20 if phone else 0), 100)),
                'tiktok_url': f"https://www.tiktok.com/@{username}",
                'last_scraped': datetime.now().isoformat()
            }

            self.supabase.insert_seller(data)
            if phone: self.send_notification(data)
            self.log(f"✅ Success: @{username} ({followers} followers)")

        except Exception as e:
            self.log(f"❌ Error profiling @{username}: {str(e)[:50]}")
        finally:
            await page.close()

    def parse_count(self, text):
        try:
            text = text.upper()
            if 'M' in text: return int(float(text.replace('M', '')) * 1000000)
            if 'K' in text: return int(float(text.replace('K', '')) * 1000)
            return int(''.join(filter(str.isdigit, text)) or 0)
        except: return 0

    async def run_category_worker(self):
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
            context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")

            self.log("🚀 WORKER 1: Category Intelligence Started (GitHub Action)")

            while datetime.now() - self.start_time < self.duration_limit:
                category = random.choice(CATEGORIES)
                self.log(f"📂 Processing Category: {category}")

                search_page = await context.new_page()
                try:
                    await search_page.goto(f"https://www.tiktok.com/search/user?q={category}")
                    await asyncio.sleep(10)

                    user_links = await search_page.query_selector_all('a[href*="/@"]')
                    usernames = []
                    for link in user_links[:15]:
                        href = await link.get_attribute('href')
                        u = re.search(r'@([\w.]+)', href)
                        if u: usernames.append(u.group(1))

                    await search_page.close()

                    for u in list(set(usernames)):
                        if datetime.now() - self.start_time > self.duration_limit: break
                        await self.extract_profile(context, u, category)
                        await asyncio.sleep(random.uniform(5, 10))
                except Exception as e:
                    self.log(f"⚠️ Search Error: {e}")
                    if not search_page.is_closed(): await search_page.close()

                await asyncio.sleep(30) # Cool down between category jumps

            self.log("⏰ Duration reached. Stopping worker.")
            await browser.close()

if __name__ == "__main__":
    scraper = AcquisitionAIScraper()
    asyncio.run(scraper.run_category_worker())

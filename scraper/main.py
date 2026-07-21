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

CATEGORIES_MAP = {
    "Kuliner": ["makanan", "kuliner", "cemilan", "keripik", "bakso", "frozen food", "kopi", "roti", "kue"],
    "Fashion": ["baju wanita", "gamis", "hijab", "sepatu wanita", "tas wanita", "baju anak", "seragam", "batik", "kaos", "hoodie"],
    "Beauty": ["makeup", "serum", "facial wash", "masker wajah"],
    "Skincare": ["skincare", "serum", "sunscreen", "paket skincare"],
    "Gadget": ["aksesoris hp", "case iphone", "charger", "gadget"],
    "Elektronik": ["elektronik", "peralatan rumah", "lampu"],
    "Home Living": ["dekorasi rumah", "perabot", "sprei", "gorden"],
    "Jasa": ["jasa desain", "jasa edit", "jasa titip", "jastip"]
}

INDONESIA_KEYWORDS = [
    "indonesia", "jakarta", "bandung", "medan", "surabaya", "semarang", "makassar", "jogja", "yogyakarta",
    "bali", "lampung", "palembang", "aceh", "bekasi", "depok", "bogor", "tangerang", "wa", "whatsapp",
    "shopee", "tokopedia", "gratis ongkir", "cod", "ready", "ready stock", "reseller", "admin", "pengiriman", "ongkir"
]

SELLER_KEYWORDS = [
    "order", "admin", "wa", "whatsapp", "tokopedia", "shopee", "tiktok shop", "ready", "cod",
    "reseller", "supplier", "grosir", "official", "open order", "po", "preorder"
]

CITY_LIST = ["jakarta", "bandung", "medan", "surabaya", "bekasi", "bogor", "depok", "tangerang", "malang", "semarang", "palembang", "aceh", "makassar", "padang", "jambi", "lampung"]

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
        self.min_followers = 100
        self.max_followers = 100000

    def log(self, msg):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

    def send_notification(self, data):
        # Lead notifications disabled per user request
        return

    async def extract_profile(self, context, username, category="General"):
        # Check if already exists
        existing = self.supabase.client.table('sellers').select('username').eq('username', username).execute()
        if existing.data:
            self.log(f"⏩ Skipping @{username} (Already exists)")
            return

        page = await context.new_page()
        await page.set_extra_http_headers({"Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8"})

        try:
            self.log(f"🕵️  Scanning profile: @{username} [{category}]")
            await page.goto(f"https://www.tiktok.com/@{username}", wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_selector('[data-e2e="user-title"]', timeout=15000)

            display_name = await page.inner_text('[data-e2e="user-title"]')
            bio = await page.inner_text('[data-e2e="user-bio"]') if await page.query_selector('[data-e2e="user-bio"]') else ""
            full_text = (display_name + " " + bio).lower()

            # 1. INDONESIA CHECK
            indo_score = sum(1 for kw in INDONESIA_KEYWORDS if kw in full_text)
            if indo_score == 0:
                self.log(f"⏩ Skipping @{username} (Non-Indonesian)")
                await page.close()
                return

            # 2. SELLER CHECK
            seller_score = sum(1 for kw in SELLER_KEYWORDS if kw in bio.lower())
            if seller_score == 0:
                self.log(f"⏩ Skipping @{username} (Not a Seller)")
                await page.close()
                return

            # 3. FOLLOWER CHECK (100 - 100,000)
            followers_raw = await page.inner_text('[data-e2e="followers-count"]')
            followers = self.parse_count(followers_raw)
            if followers < self.min_followers or followers > self.max_followers:
                self.log(f"⏩ Skipping @{username} ({followers} followers - Out of range)")
                await page.close()
                return

            # 4. CITY EXTRACTION
            city = "Indonesia"
            for c in CITY_LIST:
                if c in full_text:
                    city = c.title()
                    break

            # 5. PHONE EXTRACTION
            phone_match = re.search(r'(?:\+62|62|08)[0-9]{9,12}', bio.replace(" ", "").replace("-", ""))
            phone = phone_match.group(0) if phone_match else None

            # 6. POTENTIAL SCORE CALCULATION
            p_score = 0
            p_score += min((followers / 1000) * 0.3, 30)
            if phone: p_score += 30
            p_score += min(seller_score * 5, 20)
            if await page.query_selector('[data-e2e="user-verified"]'): p_score += 20

            data = {
                'platform': 'tiktok',
                'username': username,
                'display_name': display_name,
                'followers_count': followers,
                'phone_number': phone,
                'category': category,
                'city': city,
                'potential_score': int(min(p_score + 20, 100)),
                'tiktok_url': f"https://www.tiktok.com/@{username}",
                'last_scraped': datetime.now().isoformat()
            }

            self.supabase.insert_seller(data)
            self.log(f"✅ Saved UMKM: @{username} ({followers} followers in {city})")

        except Exception as e:
            self.log(f"❌ Error profiling @{username}: {str(e)[:50]}")
        finally:
            await page.close()

    def parse_count(self, text):
        try:
            text = text.upper()
            if 'M' in text: return int(float(text.replace('M', '').replace(',', '.')) * 1000000)
            if 'K' in text: return int(float(text.replace('K', '').replace(',', '.')) * 1000)
            return int(''.join(filter(str.isdigit, text)) or 0)
        except: return 0

    async def run_category_worker(self):
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
            context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")

            self.log("🚀 WORKER 1: UMKM Intelligence Started (GitHub Action)")
            self.log(f"⏰ Timer: Script will run until { (self.start_time + self.duration_limit).strftime('%H:%M:%S') }")

            while datetime.now() - self.start_time < self.duration_limit:
                category_name = random.choice(list(CATEGORIES_MAP.keys()))
                search_query = random.choice(CATEGORIES_MAP[category_name])

                elapsed = str(datetime.now() - self.start_time).split('.')[0]
                self.log(f"⏳ Progress: {elapsed} | 📂 Category: {category_name} | 🔎 Search: {search_query}")

                search_page = await context.new_page()
                try:
                    await search_page.goto(f"https://www.tiktok.com/search/user?q={search_query}")
                    await asyncio.sleep(10)

                    # AUTO-SCROLL
                    for _ in range(5):
                        await search_page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                        await asyncio.sleep(2)

                    user_links = await search_page.query_selector_all('a[href*="/@"]')
                    usernames = []
                    for link in user_links:
                        href = await link.get_attribute('href')
                        u = re.search(r'@([\w.]+)', href)
                        if u: usernames.append(u.group(1))

                    await search_page.close()

                    usernames = list(set(usernames))
                    self.log(f"📋 Found {len(usernames)} potential users for {search_query}")

                    for u in usernames:
                        if datetime.now() - self.start_time > self.duration_limit: break
                        await self.extract_profile(context, u, category_name)
                        await asyncio.sleep(random.uniform(7, 15))
                except Exception as e:
                    self.log(f"⚠️ Search Error: {e}")
                    if not search_page.is_closed(): await search_page.close()

                await asyncio.sleep(30)

            self.log("⏰ Duration reached. Stopping worker.")
            await browser.close()

if __name__ == "__main__":
    scraper = AcquisitionAIScraper()
    asyncio.run(scraper.run_category_worker())

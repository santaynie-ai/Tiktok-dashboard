import asyncio
import os
import random
from datetime import datetime
from playwright.async_api import async_playwright
from supabase_client import SupabaseClient
import re

class TikTokScraper:
    def __init__(self):
        self.supabase = SupabaseClient()
        self.target_usernames = [
            # Add some sample UMKM accounts (replace with real ones)
            'fashionumkm', 'kulinerlokal', 'craftindonesia',
            'batikindonesia', 'tenunindonesia', 'kopilokal',
            'snacksehat', 'skincareherbal', 'furniturekayu'
        ]

    async def scrape_user(self, page, username):
        try:
            url = f"https://www.tiktok.com/@{username}"
            await page.goto(url, wait_until='networkidle')

            # Wait for content to load
            await page.wait_for_selector('h1[data-e2e="user-title"]', timeout=10000)

            # Get user info
            display_name = await page.text_content('h1[data-e2e="user-title"]')

            # Get follower count
            follower_elem = await page.query_selector('[data-e2e="followers-count"]')
            follower_text = await follower_elem.text_content() if follower_elem else '0'
            followers = self.parse_count(follower_text)

            # Get following count
            following_elem = await page.query_selector('[data-e2e="following-count"]')
            following_text = await following_elem.text_content() if following_elem else '0'
            following = self.parse_count(following_text)

            # Get video count
            video_elem = await page.query_selector('[data-e2e="video-count"]')
            video_text = await video_elem.text_content() if video_elem else '0'
            videos = self.parse_count(video_text)

            # Get likes count
            likes_elem = await page.query_selector('[data-e2e="likes-count"]')
            likes_text = await likes_elem.text_content() if likes_elem else '0'
            likes = self.parse_count(likes_text)

            # Get engagement rate (simplified)
            engagement_rate = self.calculate_engagement(followers, likes, videos)

            # Check if viral (simplified)
            is_viral = followers > 10000 and engagement_rate > 5
            viral_reason = None
            if is_viral:
                reasons = []
                if followers > 10000:
                    reasons.append("High follower count")
                if engagement_rate > 5:
                    reasons.append("High engagement rate")
                if videos > 50:
                    reasons.append("Active content creator")
                viral_reason = " & ".join(reasons)

            return {
                'username': username,
                'display_name': display_name or username,
                'avatar_url': f"https://www.tiktok.com/@{username}/profile",
                'followers_count': followers,
                'following_count': following,
                'video_count': videos,
                'likes_count': likes,
                'engagement_rate': engagement_rate,
                'is_viral': is_viral,
                'viral_reason': viral_reason,
                'tiktok_url': url,
                'last_scraped': datetime.now().isoformat()
            }

        except Exception as e:
            print(f"Error scraping @{username}: {e}")
            return None

    def parse_count(self, text):
        """Parse count from TikTok format (e.g., '1.5M', '100K')"""
        try:
            text = text.strip().replace(',', '')
            if 'M' in text:
                return int(float(text.replace('M', '')) * 1000000)
            elif 'K' in text:
                return int(float(text.replace('K', '')) * 1000)
            else:
                return int(text) if text else 0
        except:
            return 0

    def calculate_engagement(self, followers, likes, videos):
        """Calculate engagement rate"""
        if followers == 0:
            return 0
        # Simplified engagement calculation
        total_engagement = likes + (videos * 100)  # assume average 100 likes per video
        rate = (total_engagement / followers) * 100
        return min(rate, 20)  # Cap at 20%

    async def scrape_all(self):
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )
            page = await context.new_page()

            for username in self.target_usernames:
                print(f"Scraping @{username}...")
                data = await self.scrape_user(page, username)
                if data:
                    result = self.supabase.insert_seller(data)
                    if result:
                        print(f"✅ Successfully saved @{username}")
                    else:
                        print(f"❌ Failed to save @{username}")
                else:
                    print(f"❌ Failed to scrape @{username}")

                # Random delay to avoid detection
                await asyncio.sleep(random.uniform(3, 8))

            await browser.close()

async def main():
    scraper = TikTokScraper()
    await scraper.scrape_all()

if __name__ == "__main__":
    asyncio.run(main())
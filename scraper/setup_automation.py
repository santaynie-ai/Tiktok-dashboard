import os
import requests
from dotenv import load_dotenv

# Load ENV
load_dotenv(os.path.join(os.path.dirname(__file__), '../frontend/.env'))

def setup_webhook():
    wa_url = os.environ.get('VITE_WA_API_URL')
    wa_id = os.environ.get('VITE_WA_INSTANCE_ID')
    wa_token = os.environ.get('VITE_WA_API_TOKEN')

    # Target URL: This should be your Vercel URL + /api/webhook
    # Usually https://tiktok-dashboard-xyz.vercel.app/api/webhook
    print("\n--- WhatsApp Automation Setup ---")
    vercel_url = input("Masukkan URL Vercel Anda (contoh: https://my-app.vercel.app): ").strip()

    if not vercel_url.startswith("http"):
        print("❌ Error: URL harus dimulai dengan http:// atau https://")
        return

    webhook_url = f"{vercel_url}/api/webhook"

    print(f"📡 Setting Webhook to: {webhook_url}")

    # Green-API Set Settings
    url = f"{wa_url}/waInstance{wa_id}/setSettings/{wa_token}"
    payload = {
        "webhookUrl": webhook_url,
        "outgoingWebhook": "no",
        "stateInstanceWebhook": "yes",
        "incomingWebhook": "yes",
        "deviceWebhook": "no",
        "statusInstanceWebhook": "no"
    }

    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print("✅ BERHASIL! Sekarang WhatsApp Anda terhubung otomatis ke Vercel.")
            print("🚀 Anda tidak perlu lagi menjalankan wa_handler.py secara manual.")
        else:
            print(f"❌ Gagal: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    setup_webhook()

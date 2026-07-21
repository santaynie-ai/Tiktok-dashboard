import os
import time
import requests
import re
from supabase_client import SupabaseClient
from dotenv import load_dotenv

# Load ENV from frontend directory
load_dotenv(os.path.join(os.path.dirname(__file__), '../frontend/.env'))

class WAApprovalHandler:
    def __init__(self):
        self.supabase = SupabaseClient().client
        self.wa_url = os.environ.get('VITE_WA_API_URL')
        self.wa_id = os.environ.get('VITE_WA_INSTANCE_ID')
        self.wa_token = os.environ.get('VITE_WA_API_TOKEN')

        if not all([self.wa_url, self.wa_id, self.wa_token]):
            print("❌ Error: Green-API credentials not found in .env")
            exit(1)

        print("🚀 WA Approval Handler is running...")
        print(f"📡 Instance ID: {self.wa_id}")

    def receive_notification(self):
        try:
            url = f"{self.wa_url}/waInstance{self.wa_id}/receiveNotification/{self.wa_token}"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"⚠️ Polling error: {e}")
        return None

    def delete_notification(self, receipt_id):
        try:
            url = f"{self.wa_url}/waInstance{self.wa_id}/deleteNotification/{self.wa_token}/{receipt_id}"
            requests.delete(url)
        except:
            pass

    def process_message(self, chat_id, text):
        # Pattern: ACC <ID> or REJ <ID>
        match = re.search(r'(ACC|REJ)\s+(\d+)', text.upper())
        if not match:
            return

        action = "approved" if match.group(1) == "ACC" else "rejected"
        request_id = match.group(2)

        print(f"📩 Processing {action} for Request ID: {request_id}")

        try:
            # Update status in Supabase
            result = self.supabase.table('login_requests') \
                .update({'status': action}) \
                .eq('id', request_id) \
                .eq('status', 'pending') \
                .execute()

            if result.data:
                print(f"✅ Success: Request {request_id} updated to {action}")
                # Optional: Send confirmation back to WA
                self.send_feedback(chat_id, f"✅ Request ID {request_id} has been *{action.upper()}*.")
            else:
                print(f"⚠️ Failed: Request {request_id} not found or already processed.")
        except Exception as e:
            print(f"❌ DB Error: {e}")

    def send_feedback(self, chat_id, message):
        try:
            url = f"{self.wa_url}/waInstance{self.wa_id}/sendMessage/{self.wa_token}"
            requests.post(url, json={"chatId": chat_id, "message": message})
        except:
            pass

    def run(self):
        while True:
            notification = self.receive_notification()
            if notification and 'body' in notification:
                receipt_id = notification['receiptId']
                body = notification['body']

                # Check if it's an incoming message
                if body.get('typeWebhook') == 'incomingMessageReceived':
                    msg_data = body.get('messageData', {})
                    if msg_data.get('typeMessage') == 'textMessage':
                        text = msg_data.get('textMessageData', {}).get('textMessage', '')
                        chat_id = body.get('senderData', {}).get('chatId')
                        self.process_message(chat_id, text)

                self.delete_notification(receipt_id)

            time.sleep(2) # Poll every 2 seconds

if __name__ == "__main__":
    handler = WAApprovalHandler()
    handler.run()

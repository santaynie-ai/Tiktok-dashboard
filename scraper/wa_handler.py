import os
import time
import requests
import re
from supabase_client import SupabaseClient
from dotenv import load_dotenv

# Load ENV
load_dotenv(os.path.join(os.path.dirname(__file__), '../frontend/.env'))

class WAApprovalHandler:
    def __init__(self):
        self.supabase = SupabaseClient().client
        self.wa_url = os.environ.get('VITE_WA_API_URL')
        self.wa_id = os.environ.get('VITE_WA_INSTANCE_ID')
        self.wa_token = os.environ.get('VITE_WA_API_TOKEN')

        print("🚀 WA Poll Handler is running...")

    def receive_notification(self):
        try:
            url = f"{self.wa_url}/waInstance{self.wa_id}/receiveNotification/{self.wa_token}"
            response = requests.get(url, timeout=10)
            return response.json() if response.status_code == 200 else None
        except: return None

    def delete_notification(self, receipt_id):
        try:
            url = f"{self.wa_url}/waInstance{self.wa_id}/deleteNotification/{self.wa_token}/{receipt_id}"
            requests.delete(url)
        except: pass

    def handle_poll_vote(self, body):
        """Processes a vote from a WhatsApp Poll"""
        try:
            # Green-API structure for poll vote
            poll_data = body.get('messageData', {}).get('pollVoteMessageData', {})
            if not poll_data:
                # Some instances use different naming
                poll_data = body.get('messageData', {}).get('pollVoteMessage', {})

            option_name = poll_data.get('optionName', '').upper()

            # Since we can't easily get the ID from the vote object,
            # we'll target the LATEST pending request for security and simplicity
            action = None
            if "APPROVE" in option_name: action = "approved"
            elif "REJECT" in option_name: action = "rejected"

            if action:
                print(f"📩 Poll Vote Received: {option_name} -> Action: {action}")

                # Update the latest pending request
                result = self.supabase.table('login_requests') \
                    .select('id') \
                    .eq('status', 'pending') \
                    .order('created_at', desc=True) \
                    .limit(1) \
                    .execute()

                if result.data:
                    rid = result.data[0]['id']
                    self.supabase.table('login_requests').update({'status': action}).eq('id', rid).execute()
                    print(f"✅ Request {rid} has been {action} via Poll!")
        except Exception as e:
            print(f"❌ Poll Process Error: {e}")

    def run(self):
        while True:
            notif = self.receive_notification()
            if notif and 'body' in notif:
                body = notif['body']
                receipt_id = notif['receiptId']

                # Handle text fallback
                if body.get('typeWebhook') == 'incomingMessageReceived':
                    msg_data = body.get('messageData', {}).get('textMessageData', {})
                    text = msg_data.get('textMessage', '').upper()
                    if "ACC" in text:
                         self.supabase.table('login_requests').update({'status': 'approved'}).eq('status', 'pending').execute()
                    elif "REJ" in text or "NO" in text:
                         self.supabase.table('login_requests').update({'status': 'rejected'}).eq('status', 'pending').execute()

                # Handle Poll Vote
                elif body.get('typeWebhook') == 'pollVoteMessageReceived' or body.get('typeWebhook') == 'incomingPollVote':
                    self.handle_poll_vote(body)

                self.delete_notification(receipt_id)
            time.sleep(2)

if __name__ == "__main__":
    WAApprovalHandler().run()

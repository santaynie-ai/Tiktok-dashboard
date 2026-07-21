import os
import json
from http.server import BaseHTTPRequestHandler
from supabase import create_client

# Initialize Supabase from Env
SUPABASE_URL = os.environ.get('VITE_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY') or os.environ.get('VITE_SUPABASE_ANON_KEY')

def get_supabase():
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    return create_client(SUPABASE_URL, SUPABASE_KEY)

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        notification = json.loads(post_data.decode('utf-8'))

        print(f"Incoming Webhook: {notification.get('typeWebhook')}")

        supabase = get_supabase()
        if not supabase:
            self.send_response(500)
            self.end_headers()
            return

        body = notification.get('body', {})
        type_webhook = notification.get('typeWebhook')

        # 1. Handle Poll Vote
        if type_webhook in ['pollVoteMessageReceived', 'incomingPollVote']:
            poll_data = body.get('messageData', {}).get('pollVoteMessageData', {}) or body.get('messageData', {}).get('pollVoteMessage', {})
            option_name = poll_data.get('optionName', '').upper()

            action = None
            if "APPROVE" in option_name: action = "approved"
            elif "REJECT" in option_name: action = "rejected"

            if action:
                # Update latest pending request
                res = supabase.table('login_requests').select('id').eq('status', 'pending').order('created_at', desc=True).limit(1).execute()
                if res.data:
                    rid = res.data[0]['id']
                    supabase.table('login_requests').update({'status': action}).eq('id', rid).execute()
                    print(f"✅ Webhook: Request {rid} {action} via Poll")

        # 2. Handle Text Fallback
        elif type_webhook == 'incomingMessageReceived':
            text = body.get('messageData', {}).get('textMessageData', {}).get('textMessage', '').upper()
            if "ACC" in text:
                supabase.table('login_requests').update({'status': 'approved'}).eq('status', 'pending').order('created_at', desc=True).limit(1).execute()
            elif "REJ" in text or "NO" in text:
                supabase.table('login_requests').update({'status': 'rejected'}).eq('status', 'pending').order('created_at', desc=True).limit(1).execute()

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status': 'success'}).encode())

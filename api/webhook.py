import os
import json
import re
from http.server import BaseHTTPRequestHandler
from supabase import create_client

def get_supabase():
    url = os.environ.get('VITE_SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_KEY') or os.environ.get('VITE_SUPABASE_ANON_KEY')
    return create_client(url, key)

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)

        try:
            data = json.loads(post_data.decode('utf-8'))
            body = data.get('body', {})
            type_webhook = data.get('typeWebhook')
            supabase = get_supabase()

            # LOGIKA: Deteksi Klik Tombol Poll (Pemungutan Suara)
            if type_webhook in ['pollVoteMessageReceived', 'incomingPollVote']:
                poll_data = body.get('messageData', {}).get('pollVoteMessageData', {}) or body.get('messageData', {}).get('pollVoteMessage', {})
                option_name = poll_data.get('optionName', '').upper()

                # Cari ID di dalam teks tombol (Contoh: "APPROVE [12]")
                id_match = re.search(r'\[(\d+)\]', option_name)
                if id_match:
                    rid = id_match.group(1)
                    status = 'approved' if 'APPROVE' in option_name else 'rejected'
                    supabase.table('login_requests').update({'status': status}).eq('id', rid).execute()
                    print(f"✅ Webhook Success: Request {rid} updated to {status}")

            # LOGIKA: Deteksi Balasan Teks (ACC 12 / NO 12)
            elif type_webhook == 'incomingMessageReceived':
                text = body.get('messageData', {}).get('textMessageData', {}).get('textMessage', '').upper()
                match = re.search(r'(ACC|REJ|NO)\s+(\d+)', text)
                if match:
                    action = 'approved' if match.group(1) == 'ACC' else 'rejected'
                    rid = match.group(2)
                    supabase.table('login_requests').update({'status': action}).eq('id', rid).execute()

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok'}).encode())
        except Exception as e:
            print(f"❌ Webhook Error: {e}")
            self.send_response(500)
            self.end_headers()

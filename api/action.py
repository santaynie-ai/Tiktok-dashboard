import os
import json
from http.server import BaseHTTPRequestHandler
from supabase import create_client

def get_supabase():
    url = os.environ.get('VITE_SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_KEY') or os.environ.get('VITE_SUPABASE_ANON_KEY')
    return create_client(url, key)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        from urllib.parse import urlparse, parse_qs
        query = parse_qs(urlparse(self.path).query)

        rid = query.get('id', [None])[0]
        status = query.get('status', [None])[0]

        if rid and status:
            supabase = get_supabase()
            supabase.table('login_requests').update({'status': status}).eq('id', rid).execute()

            message = "✅ AKSES DISETUJUI!" if status == 'approved' else "❌ AKSES DITOLAK."

            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(f"""
                <html>
                    <body style="font-family: sans-serif; text-align: center; padding-top: 100px;">
                        <h1 style="color: {'#22c55e' if status == 'approved' else '#ef4444'}">{message}</h1>
                        <p>Anda bisa menutup halaman ini sekarang.</p>
                    </body>
                </html>
            """.encode())
        else:
            self.send_response(400)
            self.end_headers()

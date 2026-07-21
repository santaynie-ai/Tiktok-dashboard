import os
import json
from http.server import BaseHTTPRequestHandler
from supabase import create_client

def get_supabase():
    # Gunakan SERVICE_KEY agar bisa bypass RLS jika perlu,
    # tapi ANON_KEY juga OK jika RLS dimatikan.
    url = os.environ.get('VITE_SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_KEY') or os.environ.get('VITE_SUPABASE_ANON_KEY')
    return create_client(url, key)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        from urllib.parse import urlparse, parse_qs
        query = parse_qs(urlparse(self.path).query)

        rid_str = query.get('id', [None])[0]
        status = query.get('status', [None])[0]

        if rid_str and status:
            try:
                supabase = get_supabase()
                # Konversi rid ke integer jika perlu, Supabase biasanya handle otomatis
                # tapi kita pastikan match dengan tipe data BIGINT
                rid = int(rid_str)

                result = supabase.table('login_requests').update({'status': status}).eq('id', rid).execute()

                success_msg = "✅ AKSES BERHASIL DISETUJUI!" if status == 'approved' else "❌ AKSES TELAH DITOLAK."
                color = "#22c55e" if status == 'approved' else "#ef4444"

                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(f"""
                    <html>
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                            <style>
                                body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica; text-align: center; padding: 50px 20px; background: #f0f2f5; }}
                                .card {{ background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; margin: auto; }}
                                h1 {{ color: {color}; margin-bottom: 20px; }}
                                p {{ color: #666; font-size: 16px; }}
                            </style>
                        </head>
                        <body>
                            <div class="card">
                                <h1>{success_msg}</h1>
                                <p>Sistem Dashboard akan segera otomatis masuk.</p>
                                <p style="font-size: 14px; margin-top: 30px;">Anda boleh menutup tab ini sekarang.</p>
                            </div>
                        </body>
                    </html>
                """.encode())
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(f"Error: {str(e)}".encode())
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Missing ID or Status")

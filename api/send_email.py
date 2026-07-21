import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import BaseHTTPRequestHandler

def send_approval_email(request_id, username, target_email):
    # Dapatkan kredensial dari Vercel Environment
    sender_email = os.environ.get('EMAIL_TIKTOK')
    sender_password = os.environ.get('EMAIL_PASSWORD') # pjvqgpfofrgvbbej

    if not sender_email or not sender_password:
        return False, "Missing Credentials"

    # Bersihkan password dari spasi jika ada
    sender_password = sender_password.replace(" ", "")

    # URL Dashboard untuk Link Persetujuan
    # VERCEL_URL adalah variable bawaan Vercel
    host = os.environ.get('VERCEL_URL', 'tiktok-dashboard-santaynie.vercel.app')
    base_url = f"https://{host}" if not host.startswith('http') else host

    approve_url = f"{base_url}/api/action?id={request_id}&status=approved"
    reject_url = f"{base_url}/api/action?id={request_id}&status=rejected"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🛡️ PERSETUJUAN AKSES: {username}"
    msg["From"] = f"Dashboard System <{sender_email}>"
    msg["To"] = target_email

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
        <h2 style="text-align: center; color: #333;">🛡️ Verifikasi Login Admin</h2>
        <p>Halo Admin, seseorang mencoba login ke sistem:</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <p><b>Username:</b> {username}</p>
            <p><b>ID Request:</b> {request_id}</p>
        </div>
        <p style="text-align: center; margin-top: 30px;">
            <a href="{approve_url}" style="background: #22c55e; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px;">✅ SETUJUI</a>
            <a href="{reject_url}" style="background: #ef4444; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">❌ TOLAK</a>
        </p>
        <p style="font-size: 12px; color: #888; text-align: center; margin-top: 40px;">Jika ini bukan Anda, silakan abaikan atau klik Tolak.</p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    # Try SMTP with TLS (587) - Standard for Vercel
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=20)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, target_email, msg.as_string())
        server.quit()
        return True, "Success"
    except Exception as e1:
        # Fallback to SSL (465)
        try:
            server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=20)
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, target_email, msg.as_string())
            server.quit()
            return True, "Success via SSL"
        except Exception as e2:
            return False, f"TLS Error: {str(e1)} | SSL Error: {str(e2)}"

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        rid = data.get('id')
        user = data.get('username')
        target = os.environ.get('EMAIL_TIKTOK', 'santaynie@gmail.com')

        success, message = send_approval_email(rid, user, target)

        self.send_response(200 if success else 500)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status': 'sent' if success else 'failed', 'message': message}).encode())

import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import BaseHTTPRequestHandler

def send_approval_email(request_id, username, target_email):
    sender_email = os.environ.get('email_tiktok')
    sender_password = os.environ.get('email_password')

    # URL Vercel untuk persetujuan
    base_url = os.environ.get('VERCEL_URL', 'tiktok-dashboard-santaynie.vercel.app')
    if not base_url.startswith('http'):
        base_url = f"https://{base_url}"

    approve_url = f"{base_url}/api/action?id={request_id}&status=approved"
    reject_url = f"{base_url}/api/action?id={request_id}&status=rejected"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🛡️ PERSETUJUAN LOGIN: {username}"
    msg["From"] = sender_email
    msg["To"] = target_email

    html = f"""
    <html>
      <body style="font-family: sans-serif; text-align: center; padding: 20px;">
        <h2>🛡️ Login Approval Required</h2>
        <p>User <b>{username}</b> sedang mencoba login ke Dashboard.</p>
        <div style="margin-top: 30px;">
          <a href="{approve_url}" style="background-color: #22c55e; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px;">✅ SETUJUI AKSES</a>
          <a href="{reject_url}" style="background-color: #ef4444; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">❌ TOLAK AKSES</a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">ID Permintaan: {request_id}</p>
      </body>
    </html>
    """
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, target_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        rid = data.get('id')
        user = data.get('username')
        target = "santaynie@gmail.com"

        success = send_approval_email(rid, user, target)

        self.send_response(200 if success else 500)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status': 'sent' if success else 'failed'}).encode())

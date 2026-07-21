import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import BaseHTTPRequestHandler

def send_approval_email(request_id, username, target_email):
    # Mengambil kredensial dari environment variables
    sender_email = os.environ.get('EMAIL_TIKTOK')
    sender_password = os.environ.get('EMAIL_PASSWORD')

    if not sender_email or not sender_password:
        print("❌ Error: Email credentials not found in environment.")
        return False

    # URL Vercel untuk persetujuan
    vercel_url = os.environ.get('VERCEL_URL', 'tiktok-dashboard-santaynie.vercel.app')
    base_url = f"https://{vercel_url}" if not vercel_url.startswith('http') else vercel_url

    approve_url = f"{base_url}/api/action?id={request_id}&status=approved"
    reject_url = f"{base_url}/api/action?id={request_id}&status=rejected"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🛡️ PERSETUJUAN LOGIN: {username}"
    msg["From"] = f"AcquisitionAI Dashboard <{sender_email}>"
    msg["To"] = target_email

    html = f"""
    <html>
      <body style="font-family: sans-serif; text-align: center; padding: 20px; background-color: #f9fafb;">
        <div style="max-width: 500px; margin: auto; background: white; padding: 40px; border-radius: 20px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937;">🛡️ Login Approval</h2>
          <p style="color: #4b5563;">User <b>{username}</b> sedang meminta akses login.</p>
          <div style="margin: 40px 0;">
            <a href="{approve_url}" style="background-color: #22c55e; color: white; padding: 16px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; margin: 10px;">✅ SETUJUI</a>
            <a href="{reject_url}" style="background-color: #ef4444; color: white; padding: 16px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; margin: 10px;">❌ TOLAK</a>
          </div>
          <p style="font-size: 11px; color: #9ca3af;">ID: {request_id} | Waktu: {os.environ.get('VERCEL_REGION', 'Cloud Server')}</p>
        </div>
      </body>
    </html>
    """
    msg.attach(MIMEText(html, "html"))

    try:
        # Gunakan Port 587 dengan STARTTLS (Lebih stabil di Cloud)
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=15)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, target_email, msg.as_string())
        server.quit()
        print(f"✅ Email sent successfully to {target_email}")
        return True
    except Exception as e:
        print(f"❌ SMTP Error: {str(e)}")
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
        self.wfile.write(json.dumps({'status': 'sent' if success else 'failed', 'error': 'SMTP issue' if not success else None}).encode())

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SENDER_EMAIL = "alishatarika26@gmail.com"
SENDER_PASSWORD = "ccjc nekl uxgv uljm"  # Gmail App Password

def send_email(to: str, subject: str, body: str, html: str = None):
    try:
        if html:
            msg = MIMEMultipart("alternative")
            msg.attach(MIMEText(body, "plain"))
            msg.attach(MIMEText(html, "html"))
        else:
            msg = MIMEText(body, "plain")
        msg["From"] = SENDER_EMAIL
        msg["To"] = to
        msg["Subject"] = subject
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, [to], msg.as_string())
        print(f"✅ Email sent to {to}: {subject}")
        return True
    except smtplib.SMTPAuthenticationError:
        print("❌ Email auth failed — check Gmail App Password")
        return False
    except Exception as e:
        print(f"❌ Email error to {to}: {e}")
        return False

def send_otp_email(to: str, otp: str, purpose: str = "verification"):
    subject = f"Your Medora OTP - {otp}"
    body = (
        f"Your OTP for {purpose} is:\n\n"
        f"  {otp}\n\n"
        f"This OTP is valid for 10 minutes. Do not share it with anyone.\n\n"
        f"Team MEDORA"
    )
    return send_email(to, subject, body)

def send_order_confirmation(email: str, customer_name: str, order_id: int, total: float, items: list):
    subject = f"Order Confirmed - MEDORA (Order #{order_id})"
    item_lines = "\n".join([f"  • {i['name']} x{i['qty']} = ₹{i['subtotal']:.2f}" for i in items])
    body = (
        f"Dear {customer_name},\n\n"
        f"Your order has been placed successfully!\n\n"
        f"Order ID: #{order_id}\n"
        f"Items:\n{item_lines}\n\n"
        f"Total: ₹{total:.2f}\n\n"
        f"Thank you for choosing Medora.\n\nTeam MEDORA"
    )
    return send_email(email, subject, body)

def send_appointment_confirmation(patient_email: str, patient_name: str, doctor_name: str, date: str, time: str):
    subject = "Appointment Confirmed - MEDORA"
    body = (
        f"Dear {patient_name},\n\n"
        f"Your appointment has been confirmed!\n\n"
        f"Doctor: {doctor_name}\n"
        f"Date:   {date}\n"
        f"Time:   {time}\n\n"
        f"Please arrive 10 minutes early.\n\nTeam MEDORA"
    )
    return send_email(patient_email, subject, body)

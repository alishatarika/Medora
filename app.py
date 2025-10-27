from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import mysql.connector
from datetime import datetime, date, timedelta
import csv
import os
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)
app.secret_key = "medora_secret_key"
SENDER_EMAIL = "alishatarika26@gmail.com"
SENDER_PASSWORD = "ccjc nekl uxgv uljm"  # Use Gmail App Password
EMERGENCY_CONTACTS = ["alisha.tarikaa@gmail.com"]

# ---------------- MySQL Config ----------------
MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Alisha@1210",
    "database": "medora_db"
}

def get_mysql_connection():
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    return conn

# ---------------- CSV Files ----------------
MEDICINE_CSV = "medora_medicines.csv"
DOCTOR_CSV = "medora_doctors.csv"

# ---------------- Initialize DB ----------------
def init_medicine_db():
    conn = get_mysql_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM medicines")
    if cursor.fetchone()[0] == 0 and os.path.exists(MEDICINE_CSV):
        with open(MEDICINE_CSV, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""INSERT INTO medicines (name, category, company, price, description)
                                  VALUES (%s, %s, %s, %s, %s)""",
                               (row.get("name"), row.get("category"), row.get("company"),
                                float(row.get("price", 0)), row.get("description")))
    conn.commit()
    cursor.close()
    conn.close()

def init_doctor_db():
    conn = get_mysql_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM doctors")
    if cursor.fetchone()[0] == 0 and os.path.exists(DOCTOR_CSV):
        with open(DOCTOR_CSV, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = row.get("name") or row.get("doctor_name") or "Unknown"
                specialty = row.get("specialty") or row.get("specialisation") or "General"
                location = row.get("location") or row.get("city") or "Unknown"
                experience = int(row.get("experience") or row.get("exp") or 0)
                fees = float(row.get("fees") or row.get("fee") or 0)
                description = row.get("description") or row.get("about") or "No description."
                cursor.execute("""INSERT INTO doctors (name, specialty, location, experience, fees, description)
                                  VALUES (%s, %s, %s, %s, %s, %s)""",
                               (name, specialty, location, experience, fees, description))
    conn.commit()
    cursor.close()
    conn.close()

# ---------------- Home & Static Pages ----------------
@app.route("/")
def home():
    return render_template("home.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/profile")
def profile():
    return render_template("medora_profile.html")

@app.route("/scan")
def scan():
    return render_template("medora_scan.html")

@app.route("/chatbot")
def chatbot():
    return render_template("medora_aichatbot.html")

@app.route("/firstaid")
def firstaid():
    return render_template("medora_emergencyAid.html")

# ---------------- Shop ----------------
@app.route("/shop")
def shop_medicine():
    query = request.args.get("query", "")
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    if query:
        cursor.execute("""SELECT * FROM medicines
                          WHERE name LIKE %s OR category LIKE %s OR company LIKE %s""",
                       ('%'+query+'%', '%'+query+'%', '%'+query+'%'))
    else:
        cursor.execute("SELECT * FROM medicines LIMIT 50")
    medicines = cursor.fetchall()
    cursor.close()
    conn.close()
    return render_template("shop.html", medicines=medicines, query=query)

@app.route("/add_to_cart/<int:med_id>")
def add_to_cart(med_id):
    cart = session.get("cart", {})
    cart[str(med_id)] = cart.get(str(med_id), 0) + 1
    session["cart"] = cart
    return redirect(url_for("cart"))

@app.route("/cart")
def cart():
    cart = session.get("cart", {})
    medicines = []
    total = 0
    if cart:
        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)
        ids = list(cart.keys())
        format_strings = ",".join(["%s"] * len(ids))
        cursor.execute(f"SELECT * FROM medicines WHERE id IN ({format_strings})", ids)
        rows = cursor.fetchall()
        for m in rows:
            qty = cart[str(m["id"])]
            subtotal = m["price"] * qty
            total += subtotal
            medicines.append({
                "id": m["id"],
                "name": m["name"],
                "category": m["category"],
                "company": m["company"],
                "price": m["price"],
                "quantity": qty,
                "subtotal": subtotal
            })
        cursor.close()
        conn.close()
    return render_template("cart.html", medicines=medicines, total=total)

@app.route("/update_cart_ajax")
def update_cart_ajax():
    med_id = request.args.get("med_id")
    action = request.args.get("action")
    quantity = request.args.get("quantity", type=int)
    if not med_id:
        return jsonify({"status": "error", "message": "No medicine ID provided."})
    cart = session.get("cart", {})
    if action == "remove" and med_id in cart:
        cart.pop(med_id)
    elif action == "update" and med_id in cart:
        if quantity > 0:
            cart[med_id] = quantity
        else:
            cart.pop(med_id)
    session["cart"] = cart
    return jsonify({"status": "success", "cart": cart})

@app.route("/checkout", methods=["GET", "POST"])
def checkout():
    cart = session.get("cart", {})
    if not cart:
        return "<h2>Your cart is empty.</h2><a href='/shop'>Back to Shop</a>"
    if request.method == "POST":
        name = request.form["name"]
        address = request.form["address"]
        phone = request.form["phone"]
        email = request.form.get("email", "")
        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)
        ids = list(cart.keys())
        format_strings = ",".join(["%s"] * len(ids))
        cursor.execute(f"SELECT * FROM medicines WHERE id IN ({format_strings})", ids)
        medicines_list = cursor.fetchall()
        total = 0
        for med in medicines_list:
            med["quantity"] = cart[str(med["id"])]
            med["subtotal"] = med["price"] * med["quantity"]
            total += med["subtotal"]
        cursor.execute("""INSERT INTO orders (customer_name, address, phone, email, order_date, total)
                          VALUES (%s, %s, %s, %s, %s, %s)""",
                       (name, address, phone, email, datetime.now(), total))
        order_id = cursor.lastrowid
        for med in medicines_list:
            cursor.execute("""INSERT INTO order_items (customer_id, medicine_id, medicine_name, price, quantity, subtotal)
                              VALUES (%s, %s, %s, %s, %s, %s)""",
                           (order_id, med["id"], med["name"], med["price"], med["quantity"], med["subtotal"]))
        conn.commit()
        cursor.close()
        conn.close()
        session["cart"] = {}
        try:
            subject = f"🚨 New Order Placed! Order ID: {order_id}"
            body = f"""
            <h3>🚨 New Order Alert!</h3>
            <p><strong>Your Order ID is:</strong> {order_id}</p>
            <p><strong>Total Amount:</strong> ₹{total}</p>
            <p>Status: ✅ Your Order is Placed Successfully </p>
            <p>Thank you for choosing Medora</p>
            """
            msg = MIMEText(body, "html")
            msg["From"] = SENDER_EMAIL
            msg["To"] = ", ".join(EMERGENCY_CONTACTS)  # List of admin emails
            msg["Subject"] = subject

            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(SENDER_EMAIL, SENDER_PASSWORD)
                server.sendmail(SENDER_EMAIL, EMERGENCY_CONTACTS, msg.as_string())
            print("✅ Order SOS email sent successfully!")
        except Exception as e:
            print("❌ Failed to send order SOS email:", e)
        return """<div style=background-color: #121212; 
            padding:50px; height:100vh; display:flex; flex-direction:column; 
            justify-content:center; align-items:center;">
    <h2>✅ Your order has been placed successfully!</h2>
    <a href='/shop' style='margin-top:20px; text-decoration:none; 
                          background-color:#14b8a6; color:white; 
                          padding:10px 20px; border-radius:5px;'>Back to Shop</a>
</div>"""
    return render_template("checkout.html")

# ---------------- Doctors ----------------
@app.route("/doctors")
def doctors():
    query = request.args.get("query", "")
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    if query:
        cursor.execute("""SELECT * FROM doctors
                          WHERE name LIKE %s OR specialty LIKE %s OR location LIKE %s""",
                       ('%'+query+'%', '%'+query+'%', '%'+query+'%'))
    else:
        cursor.execute("SELECT * FROM doctors LIMIT 50")
    doctors_list = cursor.fetchall()
    cursor.close()
    conn.close()

    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        # Return table rows for AJAX search
        rows = ""
        for doc in doctors_list:
            desc = doc["description"][:100] + ("..." if len(doc["description"]) > 100 else "")
            rows += f"""
            <tr>
                <td><strong>{doc['name']}</strong><br><small class="text-muted">{desc}</small></td>
                <td>{doc['specialty']}</td>
                <td>{doc['location']}</td>
                <td>{doc['experience']} yrs</td>
                <td>₹{doc['fees']}</td>
                <td><a href="{url_for('doctor_profile', doc_id=doc['id'])}" class="btn btn-sm btn-info">View & Book</a></td>
            </tr>
            """
        return rows

    return render_template("doctors.html", doctors=doctors_list, query=query)


@app.route("/doctor/<int:doc_id>")
def doctor_profile(doc_id):
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM doctors WHERE id=%s", (doc_id,))
    doctor = cursor.fetchone()  # Must fetch a single doctor
    cursor.close()
    conn.close()

    if not doctor:
        return "<h2>Doctor Not Found</h2><a href='/doctors'>Back</a>"

    # Time slots
    start_time = datetime.strptime("08:00", "%H:%M")
    end_time = datetime.strptime("22:00", "%H:%M")
    time_slots = []
    current = start_time
    while current <= end_time:
        time_slots.append(current.strftime("%I:%M %p"))
        current += timedelta(minutes=30)

    today = date.today().isoformat()
    return render_template("doctor_profile.html", doctor=doctor, time_slots=time_slots, today=today)


def send_appointment_confirmation(patient_email, patient_name, doctor_name, date, time):
    subject = "✅ Appointment Confirmation - MEDORA"
    message = f"""
    Dear {patient_name},

    Your appointment has been successfully booked.

    🩺 Doctor: {doctor_name}
    📅 Date: {date}
    ⏰ Time: {time}

    Thank you for choosing MEDORA for your healthcare needs.

    Regards,  
    Team MEDORA
    """

    msg = MIMEText(message)
    msg["From"] = SENDER_EMAIL
    msg["To"] = patient_email
    msg["Subject"] = subject

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, [patient_email], msg.as_string())
        print("✅ Appointment confirmation email sent to", patient_email)
        return True
    except Exception as e:
        print("❌ Failed to send appointment confirmation:", e)
        return False


@app.route("/book_appointment/<int:doc_id>", methods=["POST"])
def book_appointment(doc_id):
    user_name = request.form.get("name", "").strip()
    user_email = request.form.get("email", "").strip()
    user_phone = request.form.get("phone", "").strip()
    date_selected = request.form.get("date", "").strip()
    time_slot = request.form.get("time_slot", "").strip()

    # Check required fields
    if not all([user_name, user_email, user_phone, date_selected, time_slot]):
        return f"<h2>❌ All fields are required!</h2><a href='/doctor/{doc_id}'>Back</a>"

    # Validate phone format (extra safety)
    if not user_phone.isdigit() or len(user_phone) != 10:
        return f"<h2>❌ Phone number must be exactly 10 digits!</h2><a href='/doctor/{doc_id}'>Back</a>"

    # Optional: validate date is not in the past
    today = date.today()
    selected_date = datetime.strptime(date_selected, "%Y-%m-%d").date()
    if selected_date < today:
        return f"<h2>❌ Date cannot be in the past!</h2><a href='/doctor/{doc_id}'>Back</a>"
    
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT name FROM doctors WHERE id = %s", (doc_id,))
    doctor = cursor.fetchone()
    if not doctor:
        cursor.close()
        conn.close()
        return f"<h2>❌ Doctor not found!</h2><a href='/doctors'>Back</a>"
    
    doc_name = doctor["name"]
        # Save appointment
    conn = get_mysql_connection()
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO appointments 
                      (doctor_id, user_name, user_email, user_phone, date, time_slot, status)
                      VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                   (doc_id, user_name, user_email, user_phone, date_selected, time_slot, "Booked"))
    conn.commit()
    cursor.close()
    conn.close()
    send_appointment_confirmation(user_email, user_name, doc_name, date_selected, time_slot)

    return f"<h2>✅ Appointment booked</h2><a href='/doctors'>Back to Doctors</a>"


def send_sos_alert(location_text):
    subject = "🚨 SOS ALERT from Alisha (via MEDORA)"
    message = f"Hi,\nThis is an SOS alert from Alisha.\nLocation: {location_text}"
    msg = MIMEText(message)
    msg["From"] = SENDER_EMAIL
    msg["To"] = ", ".join(EMERGENCY_CONTACTS)
    msg["Subject"] = subject
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, EMERGENCY_CONTACTS, msg.as_string())
        return True
    except Exception as e:
        print("❌ Failed to send SOS:", e)
        return False

@app.route("/sos")
def sos_page():
    return render_template("sos_result.html")

@app.route("/send_sos", methods=["POST"])
def send_sos():
    data = request.json
    location_text = data.get("location", "Location not available")
    success = send_sos_alert(location_text)
    if success:
        return jsonify({"status": "success", "message": "✅ SOS alert sent successfully!"})
    else:
        return jsonify({"status": "error", "message": "⚠️ Error sending SOS."})

# ---------------- Run App ----------------
if __name__ == "__main__":
    init_medicine_db()
    init_doctor_db()
    app.run(debug=True)

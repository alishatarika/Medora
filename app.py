from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import sqlite3
import csv
import os
from datetime import date, datetime, timedelta

app = Flask(__name__)
app.secret_key = "medora_secret_key"

# ---------------- Database Files ----------------
MEDICINE_DB = "pharmacy.db"
DOCTOR_DB = "doctors.db"
MEDICINE_CSV = "medora_medicines.csv"
DOCTOR_CSV = "medora_doctors.csv"

# ---------------- Initialize Medicine DB ----------------
def init_medicine_db():
    if not os.path.exists(MEDICINE_DB):
        conn = sqlite3.connect(MEDICINE_DB)
        c = conn.cursor()
        c.execute("""CREATE TABLE medicines (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        category TEXT,
                        company TEXT,
                        price REAL,
                        description TEXT
                    )""")
        if os.path.exists(MEDICINE_CSV):
            with open(MEDICINE_CSV, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    price = float(row.get("price", 0))
                    description = row.get("description", "No description available.")
                    c.execute("""INSERT INTO medicines (name, category, company, price, description)
                                 VALUES (?, ?, ?, ?, ?)""",
                              (row.get("name"), row.get("category"), row.get("company"), price, description))
        conn.commit()
        conn.close()

# ---------------- Initialize Doctor DB ----------------
def init_doctor_db():
    if not os.path.exists(DOCTOR_DB):
        conn = sqlite3.connect(DOCTOR_DB)
        c = conn.cursor()
        c.execute('''CREATE TABLE doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            specialty TEXT,
            location TEXT,
            experience INTEGER,
            fees REAL,
            description TEXT
        )''')
        if os.path.exists(DOCTOR_CSV):
            with open(DOCTOR_CSV, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Flexible mapping
                    name = row.get("name") or row.get("doctor_name") or "Unknown"
                    specialty = row.get("specialty") or row.get("specialisation") or "General"
                    location = row.get("location") or row.get("city") or "Unknown"
                    try:
                        experience = int(row.get("experience") or row.get("exp") or 0)
                    except:
                        experience = 0
                    try:
                        fees = float(row.get("fees") or row.get("fee") or 0)
                    except:
                        fees = 0.0
                    description = row.get("description") or row.get("about") or "No description available."

                    c.execute("""INSERT INTO doctors (name, specialty, location, experience, fees, description)
                                 VALUES (?, ?, ?, ?, ?, ?)""",
                              (name, specialty, location, experience, fees, description))
        conn.commit()
        conn.close()


# ---------------- Helper Function ----------------
def get_db_connection(db_file):
    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row
    return conn

# ---------------- Home ----------------
@app.route("/")
def home():
    return render_template("home.html")

# ---------------- Medicine Shop ----------------
@app.route("/shop", methods=["GET"])
def shop_medicine():
    query = request.args.get("query", "")
    conn = get_db_connection(MEDICINE_DB)
    c = conn.cursor()
    if query:
        c.execute("""SELECT * FROM medicines
                     WHERE name LIKE ? OR category LIKE ? OR company LIKE ?""",
                  ('%'+query+'%', '%'+query+'%', '%'+query+'%'))
    else:
        c.execute("SELECT * FROM medicines LIMIT 50")
    medicines = c.fetchall()
    conn.close()
    return render_template("shop.html", medicines=medicines, query=query)

@app.route("/shop_ajax")
def shop_ajax():
    query = request.args.get("query", "")
    conn = get_db_connection(MEDICINE_DB)
    c = conn.cursor()
    if query:
        c.execute("""SELECT * FROM medicines
                     WHERE name LIKE ? OR category LIKE ? OR company LIKE ?""",
                  ('%'+query+'%', '%'+query+'%', '%'+query+'%'))
    else:
        c.execute("SELECT * FROM medicines LIMIT 50")
    medicines = c.fetchall()
    conn.close()
    med_list = [{"id": m["id"], "name": m["name"], "category": m["category"],
                 "company": m["company"], "price": m["price"]} for m in medicines]
    return jsonify(med_list)

# ---------------- Cart ----------------
@app.route("/add_to_cart/<int:med_id>")
def add_to_cart(med_id):
    cart = session.get("cart", {})
    cart[str(med_id)] = cart.get(str(med_id), 0) + 1
    session["cart"] = cart
    return redirect(url_for("cart"))

@app.route("/cart")
def cart():
    cart = session.get("cart", {})
    conn = get_db_connection(MEDICINE_DB)
    c = conn.cursor()
    medicines = []
    total = 0
    if cart:
        ids = list(cart.keys())
        q_marks = ",".join("?"*len(ids))
        c.execute(f"SELECT * FROM medicines WHERE id IN ({q_marks})", ids)
        rows = c.fetchall()
        for m in rows:
            qty = cart[str(m["id"])]
            subtotal = m["price"] * qty
            total += subtotal
            medicines.append({"id": m["id"], "name": m["name"], "category": m["category"],
                              "company": m["company"], "price": m["price"],
                              "quantity": qty, "subtotal": subtotal})
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

@app.route("/checkout")
def checkout():
    session["cart"] = {}
    return "<h2>✅ Order Placed Successfully!</h2><a href='/shop'>Back to Shop</a>"

# ---------------- Doctors ----------------
@app.route("/doctors")
def doctors():
    query = request.args.get("query", "")
    conn = get_db_connection(DOCTOR_DB)
    c = conn.cursor()
    if query:
        c.execute("""SELECT * FROM doctors
                     WHERE name LIKE ? OR specialty LIKE ? OR location LIKE ?""",
                  ('%'+query+'%', '%'+query+'%', '%'+query+'%'))
    else:
        c.execute("SELECT * FROM doctors LIMIT 50")
    doctors = c.fetchall()
    conn.close()

    # AJAX support
    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        rows = ""
        for doc in doctors:
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

    return render_template("doctors.html", doctors=doctors, query=query)


@app.route("/doctor/<int:doc_id>")
def doctor_profile(doc_id):
    conn = get_db_connection(DOCTOR_DB)
    c = conn.cursor()
    c.execute("SELECT * FROM doctors WHERE id=?", (doc_id,))
    doctor = c.fetchone()
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


@app.route("/book_appointment/<int:doc_id>", methods=["POST"])
def book_appointment(doc_id):
    user_name = request.form["name"]
    user_email = request.form["email"]
    date_selected = request.form["date"]
    time_slot = request.form["time_slot"]

    conn = get_db_connection(DOCTOR_DB)
    c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS appointments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    doctor_id INTEGER,
                    user_name TEXT,
                    user_email TEXT,
                    date TEXT,
                    time_slot TEXT,
                    status TEXT
                )""")
    c.execute("""INSERT INTO appointments (doctor_id, user_name, user_email, date, time_slot, status)
                 VALUES (?, ?, ?, ?, ?, ?)""",
              (doc_id, user_name, user_email, date_selected, time_slot, "Booked"))
    conn.commit()
    conn.close()

    return f"<h2>✅ Appointment booked with Doctor ID {doc_id} on {date_selected} at {time_slot}</h2><a href='/doctors'>Back to Doctors</a>"


# ---------------- Other Pages ----------------
@app.route("/scan")
def scan():
    return render_template("medora_scan.html")

@app.route("/sos")
def sos():
    return render_template("medora_emergencySos.html")

@app.route("/chatbot")
def chatbot():
    return render_template("medora_aichatbot.html")

@app.route("/firstaid")
def firstaid():
    return render_template("medora_emergencyAid.html")

@app.route("/profile")
def profile():
    return "<h2>👤 User Profile</h2><p>Profile page coming soon.</p><a href='/'>Back to Home</a>"

# ---------------- Run App ----------------
if __name__ == "__main__":
    init_medicine_db()
    init_doctor_db()
    app.run(debug=True)

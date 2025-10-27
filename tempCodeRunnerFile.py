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

        # Here you can store the order details in a DB table
        conn = get_db_connection(MEDICINE_DB)
        c = conn.cursor()
        c.execute("""CREATE TABLE IF NOT EXISTS orders (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        address TEXT,
                        phone TEXT,
                        email TEXT,
                        order_date TEXT,
                        total REAL
                    )""")
        total = 0
        ids = list(cart.keys())
        if ids:
            q_marks = ",".join("?"*len(ids))
            c.execute(f"SELECT * FROM medicines WHERE id IN ({q_marks})", ids)
            rows = c.fetchall()
            for m in rows:
                qty = cart[str(m["id"])]
                total += m["price"] * qty

        c.execute("INSERT INTO orders (name, address, phone, email, order_date, total) VALUES (?, ?, ?, ?, ?, ?)",
                  (name, address, phone, email, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), total))
        conn.commit()
        conn.close()

        # clear cart
        session["cart"] = {}
        return f"<h2>✅ we’ve successfully received your order.</p><a href='/shop'>Back to Shop</a>"

    return render_template("checkout.html")
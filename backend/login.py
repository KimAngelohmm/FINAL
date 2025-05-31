from flask import request, jsonify, session
from backend.dbconnection import create_connection
import bcrypt

def login():
    data = request.json
    username_or_email = data.get("usernameOrEmail")
    password = data.get("password")
    
    # Debug logging
    print(f"DEBUG - login - Login attempt for: {username_or_email}")

    conn = create_connection()
    if not conn:
        print("DEBUG - login - Database connection failed")
        return jsonify({"message": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)

    user = None
    role = None

    # Check restaurant_accounts first
    if "@" in username_or_email:
        print(f"DEBUG - login - Checking restaurant_accounts by email: {username_or_email}")
        cursor.execute("SELECT * FROM restaurant_accounts WHERE email = %s", (username_or_email,))
    else:
        print(f"DEBUG - login - Checking restaurant_accounts by username: {username_or_email}")
        cursor.execute("SELECT * FROM restaurant_accounts WHERE username = %s", (username_or_email,))
    
    result = cursor.fetchone()
    if result:
        user = result
        role = result["account_type"].capitalize()  # e.g., 'Cashier', 'Admin', etc.
        print(f"DEBUG - login - Found in restaurant_accounts: {role}")
        print(f"DEBUG - login - Account ID: {user.get('account_id')}")

    # If not found, check customer_accounts
    if not user:
        if "@" in username_or_email:
            print(f"DEBUG - login - Checking customer_accounts by email: {username_or_email}")
            cursor.execute("SELECT * FROM customer_accounts WHERE email = %s", (username_or_email,))
        else:
            print(f"DEBUG - login - Checking customer_accounts by username: {username_or_email}")
            cursor.execute("SELECT * FROM customer_accounts WHERE customer_username = %s", (username_or_email,))
        
        result = cursor.fetchone()
        if result:
            user = result
            role = "Customer"  # Explicitly assign customer role
            print(f"DEBUG - login - Found in customer_accounts: {role}")
            print(f"DEBUG - login - Customer ID: {user.get('customer_id')}")

    conn.close()

    if user and bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        # Store session for redirection handling if needed
        user_id = user.get("account_id") or user.get("customer_id")
        session["user_id"] = user_id
        session["role"] = role
        
        # Store username in session for display in UI
        username = None
        if role == "Customer":
            username = user.get("customer_username")
            session["username"] = username
        else:
            username = user.get("username")
            session["username"] = username
            
        print(f"DEBUG - login - Login successful. user_id: {user_id}, role: {role}, username: {username}")

        return jsonify({
            "message": "Login successful",
            "user": {
                "email": user["email"],
                "role": role
            }
        }), 200
    else:
        print("DEBUG - login - Invalid email/username or password")
        return jsonify({"message": "Invalid email/username or password"}), 401

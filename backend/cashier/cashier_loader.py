from flask import Blueprint, render_template, send_file, redirect, url_for, session, jsonify
from backend.dbconnection import create_connection
import pymysql
import io

cashier_bp = Blueprint('cashier_bp', __name__)

@cashier_bp.route('/cashier_loader')
def cashier_loader():
    return render_template('cashier_lobby.html')

@cashier_bp.route('/profile_pic')
def profile_pic():
    user_id = session.get('user_id')
    user_role = session.get('role')

    if not user_id or not user_role:
        return redirect(url_for('static', filename='assets/images/default_profile.png'))

    conn = None
    try:
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)

        # Use direct query instead of stored procedure
        print(f"DEBUG - profile_pic - Getting profile image for user_id: {user_id}, role: {user_role}")
        
        if user_role.lower() == 'customer':
            cursor.execute("SELECT profile_image FROM customer_accounts WHERE customer_id = %s", (user_id,))
        else:
            cursor.execute("SELECT profile_image FROM restaurant_accounts WHERE account_id = %s", (user_id,))
            
        result = cursor.fetchone()
        
        if result and result.get('profile_image'):
            return send_file(io.BytesIO(result.get('profile_image')), mimetype='image/jpeg')
        else:
            print(f"DEBUG - profile_pic - No profile image found for user_id: {user_id}")
            return redirect(url_for('static', filename='assets/images/default_profile.png'))

    except Exception as e:
        print(f"DEBUG - profile_pic - Error retrieving profile picture: {e}")
        return redirect(url_for('static', filename='assets/images/default_profile.png'))
    finally:
        if conn and 'cursor' in locals(): cursor.close()
        if conn: conn.close()


@cashier_bp.route('/get_username')
def get_username():
    user_id = session.get('user_id')
    role = session.get('role')
    
    # Debug logging
    print(f"DEBUG - get_username - user_id: {user_id}, role: {role}")

    if not user_id or not role:
        print("DEBUG - get_username - Not logged in (user_id or role missing)")
        return jsonify({'error': 'Not logged in'}), 401

    conn = None
    cursor = None
    try:
        conn = create_connection()
        if not conn:
            print("DEBUG - get_username - Database connection failed")
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor(dictionary=True)
        
        # Use direct query instead of stored procedure
        print(f"DEBUG - get_username - Direct query for username with user_id: {user_id}, role: {role}")
        
        if role.lower() == 'customer':
            cursor.execute("SELECT customer_username AS username FROM customer_accounts WHERE customer_id = %s", (user_id,))
        else:
            cursor.execute("SELECT username FROM restaurant_accounts WHERE account_id = %s", (user_id,))
            
        result = cursor.fetchone()
        
        # Debug logging
        print(f"DEBUG - get_username - Query result: {result}")

        if result and result.get('username'):
            username = result.get('username')
            print(f"DEBUG - get_username - Username found: {username}")
            return jsonify({'username': username})
        
        print("DEBUG - get_username - No username found")
        return jsonify({'username': None})

    except Exception as e:
        print(f"DEBUG - get_username - Error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

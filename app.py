import sys
import os
# Fix for Windows: Define O_NONBLOCK if not available
try:
    from os import O_NONBLOCK
except ImportError:
    O_NONBLOCK = 0  # Use 0 as fallback on Windows
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
try:
    from dotenv import load_dotenv
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-dotenv"])
    from dotenv import load_dotenv
load_dotenv("C:/xampp/htdocs/new_anyhaw_kim/new_anyhaw/static/assets/localfile/restaurantsetting.env")
print("EMAIL_ADDRESS:", os.getenv("EMAIL_ADDRESS"))
print("EMAIL_PASSWORD:", os.getenv("EMAIL_PASSWORD"))

import io
from flask import Flask, redirect, render_template, session, url_for, request, jsonify, send_from_directory, send_file
from flask_cors import CORS

from backend.login import login
from backend.register import register_bp
from backend.dbconnection import create_connection
from backend.forgotpassword import forgot_password
from backend.forgotpassword import send_email
from backend.forgotpassword import verify_reset_code
from backend.forgotpassword import reset_password
from backend.cashier.cashier_settings import cashier_settings_bp
from backend.cashier.cashier_loader import cashier_bp
from backend.logout import logout_bp
from backend.cashier.cashier_system import cashier_system_bp
from backend.cashier.cashier_orderque_loader import cashier_orderqueue_bp
from backend.cashier.payment_loader import cashier_payment_bp
from backend.cashier.reciepts.print_reciept import print_receipt_by_order_id
from backend.cashier.order_status_loader import cashier_orderstatus_bp
from backend.cashier.cashier_served_table_loader import cashier_served_order_bp
from backend.cashier.cashier_delivery_status_loader import cashier_delivery_status_loader_bp
from backend.cashier.cashier_dinein_history import cashier_dinein_history_bp
from backend.cashier.cashier_takeout_history import cashier_takeout_history_bp
from backend.cashier.cashier_delivery_history import cashier_delivery_history_bp
from backend.cashier.payment_loader_delivery import cashier_payment_delivery_bp
from backend.cashier.payment_delivery_payment_loader import cashier_delivery_logging_bp
from backend.kitchen.kitchen_loader import kitchen_bp
from backend.kitchen.kitchen_orderque_loader import kitchen_orderqueue_bp
from backend.kitchen.kitchen_orderque_loader_public import kitchen_public_order_queue_loader_bp
from backend.kitchen.kitchen_settings import kitchen_settings_bp
from backend.admin.admin_loader import admin_bp
from backend.dashboard_loader import dashboard_loader_bp

# Create customer blueprint
from flask import Blueprint, send_file, redirect, request, jsonify

customer_bp = Blueprint('customer_bp', __name__)

@customer_bp.route('/profile_pic')
def profile_pic():
    user_id = session.get('user_id')
    user_role = session.get('role', '').lower()
    
    if not user_id:
        return send_from_directory('static/assets/images', 'navbar_logo.png')

    conn = None
    try:
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)
        
        print(f"DEBUG - Getting profile image for user_id: {user_id}, role: {user_role}")
        
        # Check appropriate table based on user role
        if user_role == 'customer':
            cursor.execute("SELECT profile_image FROM customer_accounts WHERE customer_id = %s", (user_id,))
        else:
            # Check restaurant_accounts for staff/admin/etc.
            cursor.execute("SELECT profile_image FROM restaurant_accounts WHERE account_id = %s", (user_id,))
            
        result = cursor.fetchone()
        
        if result and result.get('profile_image'):
            # Determine image type (default to JPEG if can't detect)
            mimetype = 'image/jpeg'
            image_data = result.get('profile_image')
            
            # Simple magic number check for PNG
            if len(image_data) >= 8 and image_data[:8] == b'\x89PNG\r\n\x1a\n':
                mimetype = 'image/png'
            
            return send_file(io.BytesIO(image_data), mimetype=mimetype)
        else:
            print(f"DEBUG - No profile image found for user_id: {user_id}")
            return send_from_directory('static/assets/images', 'navbar_logo.png')

    except Exception as e:
        print(f"DEBUG - Error retrieving profile picture: {e}")
        return send_from_directory('static/assets/images', 'navbar_logo.png')
    finally:
        if conn and 'cursor' in locals():
            cursor.close()
        if conn:
            conn.close()

@customer_bp.route('/customer_ui')
def customer_ui():
    return render_template('customer_ui.html')

@customer_bp.route('/update_profile_picture', methods=['POST'])
def update_profile_picture():
    if 'user_id' not in session:
        print("DEBUG - No user_id in session")
        return jsonify({'error': 'Not logged in'}), 401

    user_id = session['user_id']
    user_role = session.get('role', '').lower()
    print(f"DEBUG - Processing profile update for user_id: {user_id}, role: {user_role}")
    
    # Verify session details
    print(f"DEBUG - Full session data: {session}")
    
    if 'profilePic' not in request.files:
        print("DEBUG - No profilePic in request.files. Available fields:", list(request.files.keys()))
        return jsonify({'error': 'No file in request'}), 400
        
    file = request.files.get('profilePic')
    
    if not file or file.filename == '':
        print("DEBUG - Empty file or filename")
        return jsonify({'error': 'No file selected'}), 400
        
    print(f"DEBUG - File info: {file.filename}, {file.content_type}")

    try:
        image_blob = file.read()
        print(f"DEBUG - Image size: {len(image_blob)} bytes")
        
        if len(image_blob) > 5 * 1024 * 1024:  # 5MB limit
            print("DEBUG - File too large")
            return jsonify({'error': 'File too large (max 5MB)'}), 413

        conn = None
        cursor = None

        try:
            conn = create_connection()
            if not conn:
                print("DEBUG - Database connection failed")
                return jsonify({'error': 'Database connection failed'}), 500
                
            cursor = conn.cursor(dictionary=True)
            
            # Verify table structure
            if user_role == 'customer':
                print("DEBUG - Verifying customer_accounts table structure")
                cursor.execute("SHOW COLUMNS FROM customer_accounts")
                columns = cursor.fetchall()
                column_names = [col['Field'] for col in columns]
                print(f"DEBUG - customer_accounts columns: {column_names}")
                
                if 'profile_image' not in column_names:
                    print("DEBUG - profile_image column missing from customer_accounts table")
                    return jsonify({'error': 'Database structure issue: profile_image column missing'}), 500
                
            cursor = conn.cursor()
            print(f"DEBUG - Updating profile picture for user_id: {user_id}")
            
            # Update profile image in the appropriate table based on user role
            if user_role == 'customer':
                print(f"DEBUG - Using customer_accounts table for update")
                try:
                    cursor.execute(
                        "UPDATE customer_accounts SET profile_image = %s WHERE customer_id = %s", 
                        (image_blob, user_id)
                    )
                    affected_rows = cursor.rowcount
                    print(f"DEBUG - Query affected {affected_rows} rows")
                    
                    # If no rows affected, check if the customer_id exists
                    if affected_rows == 0:
                        cursor = conn.cursor(dictionary=True)
                        cursor.execute("SELECT customer_id FROM customer_accounts WHERE customer_id = %s", (user_id,))
                        user_exists = cursor.fetchone()
                        if not user_exists:
                            print(f"DEBUG - No user with customer_id {user_id} found in customer_accounts")
                            return jsonify({'error': f'User with ID {user_id} not found in database'}), 404
                        cursor = conn.cursor()
                except Exception as db_err:
                    print(f"DEBUG - Database query error: {str(db_err)}")
                    raise db_err
            else:
                print(f"DEBUG - Using restaurant_accounts table for update")
                cursor.execute(
                    "UPDATE restaurant_accounts SET profile_image = %s WHERE account_id = %s", 
                    (image_blob, user_id)
                )
            
            conn.commit()
            
            print(f"DEBUG - Profile picture updated successfully")
            return jsonify({'message': 'Profile picture updated successfully'}), 200

        except Exception as e:
            print(f"DEBUG - Database error: {str(e)}")
            return jsonify({'error': f'Database error: {str(e)}'}), 500

        finally:
            if cursor: cursor.close()
            if conn: conn.close()
            
    except Exception as e:
        print(f"DEBUG - General error: {str(e)}")
        return jsonify({'error': f'Error processing image: {str(e)}'}), 500

# Create Flask app
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "default_secret_key")
CORS(app)

# Register function-based routes
app.route('/login', methods=['POST'])(login)
app.route('/forgot-password', methods=['POST'])(forgot_password)
app.route('/send-email', methods=['POST'])(send_email)
app.route('/verify-reset-code', methods=['POST'])(verify_reset_code)
app.route('/reset-password', methods=['POST'])(reset_password)

# Register blueprints
app.register_blueprint(register_bp)
app.register_blueprint(cashier_settings_bp)
app.register_blueprint(cashier_bp)
app.register_blueprint(logout_bp)
app.register_blueprint(cashier_system_bp)
app.register_blueprint(cashier_orderqueue_bp)
app.register_blueprint(cashier_payment_bp)
app.register_blueprint(cashier_orderstatus_bp)
app.register_blueprint(cashier_served_order_bp)
app.register_blueprint(cashier_delivery_status_loader_bp)
app.register_blueprint(cashier_dinein_history_bp)
app.register_blueprint(cashier_takeout_history_bp)
app.register_blueprint(cashier_delivery_history_bp)
app.register_blueprint(cashier_payment_delivery_bp)
app.register_blueprint(cashier_delivery_logging_bp)
app.register_blueprint(kitchen_bp)
app.register_blueprint(kitchen_orderqueue_bp)
app.register_blueprint(kitchen_public_order_queue_loader_bp)
app.register_blueprint(kitchen_settings_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(dashboard_loader_bp)
app.register_blueprint(customer_bp)

# Root route
@app.route('/')
def index():
    return render_template('index.html')

# Menu route
@app.route('/menu')
def menu():
    return render_template('menu.html')

# Run the app if this script is executed
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 
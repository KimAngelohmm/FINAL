from flask import Blueprint, request, jsonify, session 
from backend.dbconnection import create_connection
import base64
import bcrypt

cashier_settings_bp = Blueprint('cashier_settings', __name__)

@cashier_settings_bp.route('/update_account_info', methods=['POST'])
def update_account_info():
    conn = None
    cursor = None
    try:
        data = request.get_json()
        account_id = session.get('user_id')

        print(f"DEBUG - update_account_info - Request data: {data}")
        print(f"DEBUG - update_account_info - User ID: {account_id}")

        if not account_id:
            print("DEBUG - update_account_info - Unauthorized (no user_id)")
            return jsonify({"message": "Unauthorized"}), 401

        user_name = data.get('username')
        firstname = data.get('firstname')
        middlename = data.get('middlename')
        lastname = data.get('lastname')
        email = data.get('email')
        contactnumber = data.get('contactnumber')

        # Validate required fields
        if not all([user_name, firstname, lastname, email]):
            print("DEBUG - update_account_info - Missing required fields")
            return jsonify({"message": "Missing required fields"}), 400

        conn = create_connection() 
        if not conn:
            print("DEBUG - update_account_info - Database connection failed")
            return jsonify({"message": "Database connection failed"}), 500
            
        cursor = conn.cursor()
        
        # Use direct SQL update with corrected column names
        update_query = """
            UPDATE restaurant_accounts 
            SET username = %s, 
                first_name = %s, 
                middle_name = %s, 
                last_name = %s, 
                email = %s, 
                contact_number = %s 
            WHERE account_id = %s
        """
        
        cursor.execute(update_query, (
            user_name,
            firstname,
            middlename if middlename else "",  # Handle null/None values
            lastname,
            email,
            contactnumber if contactnumber else "",  # Handle null/None values
            account_id
        ))
        
        # Check if the update affected any rows
        rows_affected = cursor.rowcount
        print(f"DEBUG - update_account_info - Rows affected: {rows_affected}")
        
        if rows_affected == 0:
            print(f"DEBUG - update_account_info - No record found for user_id: {account_id}")
            return jsonify({"message": "No matching account found"}), 404

        conn.commit()
        print("DEBUG - update_account_info - Account updated successfully")
        return jsonify({"message": "Account updated successfully!"}), 200

    except Exception as e:
        print(f"DEBUG - update_account_info - Error: {e}")
        if conn:
            conn.rollback()
        return jsonify({"message": f"Error updating account: {str(e)}"}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@cashier_settings_bp.route('/get_user_account_info')
def get_user_account_info():
    conn = None
    cursor = None
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'User not logged in'}), 401

        conn = create_connection()
        cursor = conn.cursor(dictionary=True)

        # Use direct query instead of stored procedure
        print(f"DEBUG - get_user_account_info - Getting info for user_id: {user_id}")
        
        cursor.execute("""
            SELECT 
                ra.username,
                ra.Fname AS first_name,
                ra.Mname AS middle_name,
                ra.Lname AS last_name,
                ra.contact_number,
                ra.email,
                ra.account_type AS position_name
            FROM 
                restaurant_accounts ra
            WHERE 
                ra.account_id = %s
        """, (user_id,))
        
        result = cursor.fetchone()
        print(f"DEBUG - get_user_account_info - Query result: {result}")

        if result:
            return jsonify({
                'username': result['username'],
                'first_name': result['first_name'],
                'middle_name': result['middle_name'],
                'last_name': result['last_name'],
                'contact_number': result['contact_number'],
                'email': result['email'],
                'position_name': result['position_name']
            }), 200
        else:
            print(f"DEBUG - get_user_account_info - No info found for user_id: {user_id}")
            return jsonify({'error': 'User data not found'}), 404

    except Exception as e:
        print(f"DEBUG - get_user_account_info - Error: {e}")
        return jsonify({'error': 'Server error while fetching account info'}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()



@cashier_settings_bp.route('/change_password', methods=['POST'])
def change_password():
    conn = None
    cursor = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid request data"}), 400

        account_id = session.get('user_id')
        if not account_id:
            return jsonify({"message": "Unauthorized"}), 401

        old_password = data.get('old_password', '').strip()
        new_password = data.get('new_password', '').strip()

        if not old_password or not new_password:
            return jsonify({"message": "Password fields cannot be empty"}), 400

        conn = create_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT password FROM restaurant_accounts WHERE account_id = %s", (account_id,))
        result = cursor.fetchone()

        if not result:
            return jsonify({"message": "User not found"}), 404

        stored_hash = result[0]
        if isinstance(stored_hash, str):
            stored_hash = stored_hash.encode('utf-8')

        if not bcrypt.checkpw(old_password.encode('utf-8'), stored_hash):
            return jsonify({"message": "Old password is incorrect"}), 400

        new_hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        cursor.execute(
            "UPDATE restaurant_accounts SET password = %s WHERE account_id = %s",
            (new_hashed_password.decode('utf-8'), account_id)
        )

        conn.commit()
        return jsonify({"message": "Password changed successfully!"}), 200

    except Exception as e:
        print(f"[ERROR] change_password: {e}")
        return jsonify({"message": "Server error occurred while changing password"}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# updating profile picture
@cashier_settings_bp.route('/update_profile_picture', methods=['POST'])
def update_profile_picture():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    user_id = session['user_id']
    file = request.files.get('profilePic')

    if not file:
        return jsonify({'error': 'No file uploaded'}), 400

    image_blob = file.read()

    conn = None
    cursor = None

    try:
        conn = create_connection()
        cursor = conn.cursor()

        # Use direct query instead of stored procedure
        print(f"DEBUG - update_profile_picture - Updating profile picture for user_id: {user_id}")
        
        # Update profile image in restaurant accounts table
        cursor.execute(
            "UPDATE restaurant_accounts SET profile_image = %s WHERE account_id = %s", 
            (image_blob, user_id)
        )
        
        conn.commit()
        
        print(f"DEBUG - update_profile_picture - Profile picture updated successfully")
        return jsonify({'message': 'Profile picture updated successfully'}), 200

    except Exception as e:
        print(f"DEBUG - update_profile_picture - Error: {e}")
        return jsonify({'error': 'Failed to update profile picture'}), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()
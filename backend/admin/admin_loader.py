from flask import Blueprint, render_template, send_file, redirect, url_for, session, jsonify, request
from backend.dbconnection import create_connection
import pymysql
import io
import datetime
import os
import sys
import bcrypt

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route('/admin_loader')
def admin_loader():
    # Check if user is authenticated and has admin role
    if 'user_id' in session and 'role' in session and session['role'].lower() == 'admin':
        return render_template('admin_ui.html')
    else:
        # Redirect to login if not authenticated or not an admin
        return redirect(url_for('Index_home'))

@admin_bp.route('/manage_users')
def manage_users():
    # Check if user is authenticated and has admin role
    if 'user_id' in session and 'role' in session and session['role'].lower() == 'admin':
        return redirect(url_for('admin_ui'))
    else:
        # Redirect to login if not authenticated or not an admin
        return redirect(url_for('Index_home'))

@admin_bp.route('/manage_menu')
def manage_menu():
    # Check if user is authenticated and has admin role
    if 'user_id' in session and 'role' in session and session['role'].lower() == 'admin':
        return redirect(url_for('admin_ui'))
    else:
        # Redirect to login if not authenticated or not an admin
        return redirect(url_for('Index_home'))

@admin_bp.route('/dashboard_stats')
def dashboard_stats():
    """Get dashboard statistics data for AJAX requests"""
    # Check if user is authenticated and has admin role
    if 'user_id' not in session or 'role' not in session or session['role'].lower() != 'admin':
        return jsonify({'error': 'Not authorized'}), 401
    
    conn = None
    cursor = None
    try:
        conn = create_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Get total number of orders
        cursor.execute("SELECT COUNT(*) as total_orders FROM orders")
        total_orders = cursor.fetchone()['total_orders']
        
        # Get revenue
        cursor.execute("SELECT SUM(total_amount) as total_revenue FROM orders")
        total_revenue = cursor.fetchone()['total_revenue'] or 0
        
        # Get user count
        cursor.execute("SELECT COUNT(*) as user_count FROM users")
        user_count = cursor.fetchone()['user_count']
        
        # Get pending orders count
        cursor.execute("SELECT COUNT(*) as pending_orders FROM orders WHERE status = 'pending'")
        pending_orders = cursor.fetchone()['pending_orders']
        
        # Get recent orders
        cursor.execute("""
            SELECT o.order_id, u.username, o.order_date, o.total_amount, o.status
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            ORDER BY o.order_date DESC
            LIMIT 5
        """)
        recent_orders = cursor.fetchall()
        
        # Get popular menu items
        cursor.execute("""
            SELECT m.name, m.category, COUNT(*) as order_count
            FROM order_items oi
            JOIN menu_items m ON oi.item_id = m.id
            GROUP BY m.id
            ORDER BY order_count DESC
            LIMIT 5
        """)
        popular_items = cursor.fetchall()
        
        # Get staff performance
        cursor.execute("""
            SELECT u.name, u.role, COUNT(o.id) as order_count, AVG(o.rating) as avg_rating
            FROM users u
            LEFT JOIN orders o ON u.id = o.assigned_staff_id
            WHERE u.role IN ('kitchen', 'delivery', 'cashier')
            GROUP BY u.id
            ORDER BY avg_rating DESC
            LIMIT 5
        """)
        staff_performance = cursor.fetchall()
        
        # Calculate growth metrics
        # For orders - compare with last week
        cursor.execute("""
            SELECT 
                COUNT(*) as current_week_orders 
            FROM 
                orders 
            WHERE 
                order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
        """)
        current_week_orders = cursor.fetchone()['current_week_orders'] or 0
        
        cursor.execute("""
            SELECT 
                COUNT(*) as previous_week_orders 
            FROM 
                orders 
            WHERE 
                order_date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
        """)
        previous_week_orders = cursor.fetchone()['previous_week_orders'] or 1  # Avoid division by zero
        
        order_growth = ((current_week_orders - previous_week_orders) / previous_week_orders) * 100
        
        # For revenue - compare with last week
        cursor.execute("""
            SELECT 
                SUM(total_amount) as current_week_revenue 
            FROM 
                orders 
            WHERE 
                order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
        """)
        current_week_revenue = cursor.fetchone()['current_week_revenue'] or 0
        
        cursor.execute("""
            SELECT 
                SUM(total_amount) as previous_week_revenue 
            FROM 
                orders 
            WHERE 
                order_date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
        """)
        previous_week_revenue = cursor.fetchone()['previous_week_revenue'] or 1  # Avoid division by zero
        
        revenue_growth = ((current_week_revenue - previous_week_revenue) / previous_week_revenue) * 100
        
        # New users today
        cursor.execute("""
            SELECT 
                COUNT(*) as new_users_today 
            FROM 
                users 
            WHERE 
                created_at >= CURRENT_DATE()
        """)
        new_users_today = cursor.fetchone()['new_users_today']
        
        # Pending orders requiring attention (overdue)
        cursor.execute("""
            SELECT 
                COUNT(*) as urgent_orders 
            FROM 
                orders 
            WHERE 
                status = 'pending' 
                AND TIMESTAMPDIFF(HOUR, order_date, NOW()) > 2
        """)
        urgent_orders = cursor.fetchone()['urgent_orders']
        
        return jsonify({
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'user_count': user_count,
            'pending_orders': pending_orders,
            'recent_orders': recent_orders,
            'popular_items': popular_items,
            'staff_performance': staff_performance,
            'order_growth': round(order_growth, 1),
            'revenue_growth': round(revenue_growth, 1),
            'new_users_today': new_users_today,
            'urgent_orders': urgent_orders,
            'last_updated': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@admin_bp.route('/profile_pic')
def profile_pic():
    user_id = session.get('user_id')
    user_role = session.get('role')

    if not user_id or not user_role or user_role.lower() != 'admin':
        return redirect(url_for('static', filename='assets/images/default_profile.png'))

    conn = None
    try:
        conn = create_connection()
        cursor = conn.cursor()

        # Call to stored procedure to get profile image
        cursor.callproc('GetProfileImageByRole', (user_id, user_role))

        for result in cursor.stored_results():
            data = result.fetchone()

        if data and data[0]:
            return send_file(io.BytesIO(data[0]), mimetype='image/jpeg')
        else:
            return redirect(url_for('static', filename='assets/images/default_profile.png'))

    except Exception as e:
        print(f"Error retrieving profile picture: {e}")
        return redirect(url_for('static', filename='assets/images/default_profile.png'))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@admin_bp.route('/get_username')
def get_username():
    user_id = session.get('user_id')
    role = session.get('role')

    if not user_id or not role or role.lower() != 'admin':
        return jsonify({'error': 'Not logged in or not an admin'}), 401

    conn = None
    cursor = None
    try:
        conn = create_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = conn.cursor()

        cursor.callproc('GetUsernameByRole', (user_id, role))

        for result in cursor.stored_results():
            data = result.fetchone()

        if data and data[0]:
            return jsonify({'username': data[0]})
        return jsonify({'username': None})

    except Exception as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@admin_bp.route('/debug')
def debug_info():
    if 'user_id' not in session or 'role' not in session or session['role'].lower() != 'admin':
        return jsonify({'error': 'Not authorized'}), 401
    
    return jsonify({
        'session': dict(session),  # Convert session to a dict for JSON serialization
        'env': {k: v for k, v in os.environ.items()},  # Sanitize env vars for security
        'python_version': sys.version,
        'timestamp': datetime.datetime.now().isoformat()
    })

@admin_bp.route('/about_us')
def about_us():
    # Check if user is authenticated and has admin role
    if 'user_id' in session and 'role' in session and session['role'].lower() == 'admin':
        return render_template('about_us.html')
    else:
        # Redirect to login if not authenticated or not an admin
        return redirect(url_for('Index_home'))

@admin_bp.route('/update_profile_picture', methods=['POST'])
def update_profile_picture():
    if 'user_id' not in session or session.get('role', '').lower() != 'admin':
        return jsonify({'error': 'Not logged in or not an admin'}), 401

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

        # Use the existing stored procedure that works for other roles
        cursor.callproc('UpdateProfilePicture_personel', (user_id, image_blob))
        conn.commit()

        return jsonify({'message': 'Profile picture updated successfully'}), 200

    except Exception as e:
        print(f"[ERROR] admin update_profile_picture: {e}")
        return jsonify({'error': 'Failed to update profile picture'}), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@admin_bp.route('/get_user_account_info')
def get_user_account_info():
    conn = None
    cursor = None
    try:
        user_id = session.get('user_id')
        if not user_id or session.get('role', '').lower() != 'admin':
            return jsonify({'error': 'User not logged in or not an admin'}), 401

        conn = create_connection()
        cursor = conn.cursor()

        # Use the same stored procedure as for personnel
        cursor.callproc('getaccountinfo_personel', (user_id,))
        result_data = None

        for result in cursor.stored_results():
            result_data = result.fetchone()
            break

        if result_data:
            return jsonify({
                'username': result_data[0],
                'first_name': result_data[1],
                'middle_name': result_data[2],
                'last_name': result_data[3],
                'contact_number': result_data[4],
                'email': result_data[5],
                'position_name': result_data[6]
            }), 200
        else:
            return jsonify({'error': 'User data not found'}), 404

    except Exception as e:
        print(f"[ERROR] admin get_user_account_info: {e}")
        return jsonify({'error': 'Server error while fetching account info'}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@admin_bp.route('/change_password', methods=['POST'])
def change_password():
    conn = None
    cursor = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid request data"}), 400

        account_id = session.get('user_id')
        if not account_id or session.get('role', '').lower() != 'admin':
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
        print(f"[ERROR] admin change_password: {e}")
        return jsonify({"message": "Server error occurred while changing password"}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close() 
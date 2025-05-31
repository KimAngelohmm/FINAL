from flask import Blueprint, jsonify, request, session
from .dbconnection import create_connection
import mysql.connector

dashboard_loader_bp = Blueprint('dashboard_loader', __name__)

@dashboard_loader_bp.route('/load_customer_ui', methods=['GET'])
def load_customer_ui():
    """Load customer UI data"""
    if 'user_id' not in session or session['role'].lower() != 'customer':
        return jsonify({"error": "Unauthorized"}), 401
    
    user_id = session['user_id']
    
    try:
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get user data
        cursor.execute("SELECT name FROM users WHERE id = %s", (user_id,))
        user_data = cursor.fetchone()
        
        # Get active orders
        cursor.execute("""
            SELECT o.id, o.order_date, o.total_amount, o.status
            FROM orders o 
            WHERE o.user_id = %s AND o.status != 'completed' AND o.status != 'cancelled'
            ORDER BY o.order_date DESC
        """, (user_id,))
        active_orders = cursor.fetchall()
        
        # Get recent orders
        cursor.execute("""
            SELECT o.id, o.order_date, o.status
            FROM orders o 
            WHERE o.user_id = %s AND (o.status = 'completed' OR o.status = 'cancelled')
            ORDER BY o.order_date DESC
            LIMIT 5
        """, (user_id,))
        recent_orders = cursor.fetchall()
        
        # Get favorite items
        cursor.execute("""
            SELECT m.name, COUNT(*) as order_count
            FROM order_items oi
            JOIN menu_items m ON oi.item_id = m.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.user_id = %s
            GROUP BY m.id
            ORDER BY order_count DESC
            LIMIT 3
        """, (user_id,))
        favorite_items = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "user_data": user_data,
            "active_orders": active_orders,
            "recent_orders": recent_orders,
            "favorite_items": favorite_items
        })
    
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@dashboard_loader_bp.route('/load_admin_dashboard', methods=['GET'])
def load_admin_dashboard():
    """Load admin dashboard data"""
    if 'user_id' not in session or session['role'].lower() != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get order stats
        cursor.execute("""
            SELECT 
                COUNT(*) as total_orders,
                SUM(total_amount) as total_revenue,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
            FROM orders
        """)
        order_stats = cursor.fetchone()
        
        # Get user count
        cursor.execute("SELECT COUNT(*) as total_users FROM users")
        user_count = cursor.fetchone()
        
        # Get recent orders with customer details
        cursor.execute("""
            SELECT o.id, o.order_date, o.total_amount, o.status, u.name as customer_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.order_date DESC
            LIMIT 10
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
        
        cursor.close()
        conn.close()
        
        # Calculate week-over-week changes (in a real system, this would query data from last week)
        # Here we're mocking the data
        order_change_percent = 12
        revenue_change_percent = 8
        
        return jsonify({
            "order_stats": {
                "total_orders": order_stats['total_orders'],
                "total_revenue": order_stats['total_revenue'],
                "pending_orders": order_stats['pending_orders'],
                "order_change_percent": order_change_percent,
                "revenue_change_percent": revenue_change_percent
            },
            "user_count": user_count['total_users'],
            "recent_orders": recent_orders,
            "popular_items": popular_items,
            "staff_performance": staff_performance
        })
    
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@dashboard_loader_bp.route('/load_kitchen_dashboard', methods=['GET'])
def load_kitchen_dashboard():
    """Load kitchen dashboard data"""
    if 'user_id' not in session or session['role'].lower() != 'kitchen':
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get order queue stats
        cursor.execute("""
            SELECT 
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
                COUNT(CASE WHEN status = 'preparing' THEN 1 END) as in_progress_orders,
                COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_orders,
                COUNT(CASE WHEN status = 'completed' AND DATE(order_date) = CURDATE() THEN 1 END) as completed_today
            FROM orders
        """)
        order_stats = cursor.fetchone()
        
        # Get order queue
        cursor.execute("""
            SELECT o.id, o.order_date, o.status, o.type, o.table_number, o.special_instructions,
                   CASE 
                       WHEN o.type = 'dine-in' AND o.table_number < 3 THEN 'high'
                       WHEN TIMESTAMPDIFF(MINUTE, o.order_date, NOW()) > 30 THEN 'high'
                       WHEN TIMESTAMPDIFF(MINUTE, o.order_date, NOW()) > 15 THEN 'medium'
                       ELSE 'low'
                   END as priority,
                   TIMESTAMPDIFF(MINUTE, o.order_date, NOW()) as wait_time,
                   u.name as customer_name
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.status IN ('pending', 'preparing')
            ORDER BY priority DESC, o.order_date ASC
        """)
        order_queue = cursor.fetchall()
        
        # Get order items for each order
        for order in order_queue:
            cursor.execute("""
                SELECT oi.quantity, m.name, oi.special_instructions
                FROM order_items oi
                JOIN menu_items m ON oi.item_id = m.id
                WHERE oi.order_id = %s
            """, (order['id'],))
            order['items'] = cursor.fetchall()
        
        # Get inventory alerts
        cursor.execute("""
            SELECT i.name, i.current_stock, i.threshold, 
                   CASE 
                       WHEN i.current_stock < i.threshold * 0.5 THEN 'critical'
                       WHEN i.current_stock < i.threshold THEN 'low'
                       ELSE 'normal'
                   END as status
            FROM inventory i
            WHERE i.current_stock < i.threshold
            ORDER BY status ASC, i.name ASC
        """)
        inventory_alerts = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "order_stats": order_stats,
            "order_queue": order_queue,
            "inventory_alerts": inventory_alerts
        })
    
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@dashboard_loader_bp.route('/load_delivery_dashboard', methods=['GET'])
def load_delivery_dashboard():
    """Load delivery dashboard data"""
    if 'user_id' not in session or session['role'].lower() != 'delivery':
        return jsonify({"error": "Unauthorized"}), 401
    
    user_id = session['user_id']
    
    try:
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get delivery staff name
        cursor.execute("SELECT name FROM users WHERE id = %s", (user_id,))
        user_data = cursor.fetchone()
        
        # Get delivery stats
        cursor.execute("""
            SELECT 
                COUNT(*) as total_deliveries,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_deliveries,
                COUNT(CASE WHEN status IN ('preparing', 'ready', 'in-transit') THEN 1 END) as in_progress,
                COUNT(CASE WHEN status = 'ready' THEN 1 END) as new_orders
            FROM orders
            WHERE type = 'delivery' AND DATE(order_date) = CURDATE() AND (assigned_staff_id = %s OR assigned_staff_id IS NULL)
        """, (user_id,))
        delivery_stats = cursor.fetchone()
        
        # Get current deliveries
        cursor.execute("""
            SELECT o.id, o.order_date, o.status, o.total_amount, 
                   u.name as customer_name, u.phone, o.delivery_address,
                   o.payment_method, o.estimated_delivery_time,
                   CASE 
                       WHEN o.status = 'ready' THEN 'new'
                       WHEN o.status = 'in-transit' THEN 'delivering'
                       WHEN o.status = 'preparing' THEN 'picked'
                       ELSE o.status
                   END as delivery_status
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.type = 'delivery' AND o.status IN ('ready', 'preparing', 'in-transit')
            ORDER BY 
                CASE 
                    WHEN o.assigned_staff_id = %s THEN 0
                    ELSE 1
                END,
                o.order_date ASC
            LIMIT 5
        """, (user_id,))
        current_deliveries = cursor.fetchall()
        
        # Get items for each delivery
        for delivery in current_deliveries:
            cursor.execute("""
                SELECT COUNT(*) as item_count
                FROM order_items
                WHERE order_id = %s
            """, (delivery['id'],))
            item_count = cursor.fetchone()
            delivery['item_count'] = item_count['item_count'] if item_count else 0
        
        # Get today's summary
        cursor.execute("""
            SELECT 
                SUM(o.delivery_distance) as total_distance,
                COUNT(*) as total_orders,
                AVG(TIMESTAMPDIFF(MINUTE, o.pickup_time, o.delivery_time)) as avg_delivery_time,
                SUM(CASE WHEN o.payment_method = 'cash' THEN o.total_amount ELSE 0 END) as cash_collected,
                AVG(o.rating) as avg_rating
            FROM orders o
            WHERE o.type = 'delivery' AND DATE(o.order_date) = CURDATE() AND o.assigned_staff_id = %s
        """, (user_id,))
        summary = cursor.fetchone()
        
        # Get route data for optimized route planning
        cursor.execute("""
            SELECT o.id, o.delivery_address, o.estimated_delivery_time, o.delivery_distance
            FROM orders o
            WHERE o.type = 'delivery' AND o.status IN ('preparing', 'ready', 'in-transit') AND o.assigned_staff_id = %s
            ORDER BY o.estimated_delivery_time ASC
        """, (user_id,))
        route_data = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "user_data": user_data,
            "delivery_stats": delivery_stats,
            "current_deliveries": current_deliveries,
            "summary": summary,
            "route_data": route_data
        })
    
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500 
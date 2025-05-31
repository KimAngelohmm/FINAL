from flask import Blueprint, render_template, request, redirect, url_for,jsonify
from backend.dbconnection import create_connection

cashier_delivery_history_bp = Blueprint('cashier_delivery_history', __name__)

@cashier_delivery_history_bp.route('/cashier_delivery_history_loader')
def cashier_delivery_history_loader():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get only 'served' orders from Ordered_Logs, including order_type and timestamp
        cursor.execute("""
            SELECT Or_Logs_ID, Transaction_ID, customer_id, cashier_id, order_type,
                DATE_FORMAT(Date_Time, '%M %d %Y / %h:%i:%s %p') AS order_time,
                status
            FROM Ordered_Logs
            WHERE order_type = 'delivery'
            AND DATE(Date_Time) = CURDATE()
            ORDER BY Date_Time DESC
        """)
        orders_data = cursor.fetchall()

        orders = []
        for order in orders_data:
            order_id = order['Or_Logs_ID']

            # Get items in this order
            cursor.execute("""
                SELECT item_id, Item_Type, Quantity, Price_Per_Item, Total_Item_Price 
                FROM Ordered_Items
                WHERE Or_Logs_ID = %s
            """, (order_id,))
            raw_items = cursor.fetchall()

            items = []
            for item in raw_items:
                item_name = "ERROR-RETRIEVING ITEM NAME"
                item_type = item.get('Item_Type')
                item_id = item.get('item_id')

                if item_type == 'normal':
                    cursor.execute("SELECT Food_Name FROM food_list WHERE Food_ID = %s", (item_id,))
                    result = cursor.fetchone()
                    if result:
                        item_name = result['Food_Name']

                elif item_type == 'dessert':
                    cursor.execute("SELECT Dessert_Name FROM dessert_list WHERE Dessert_ID = %s", (item_id,))
                    result = cursor.fetchone()
                    if result:
                        item_name = result['Dessert_Name']

                elif item_type == 'drink':
                    cursor.execute("SELECT Drink_Name FROM drink_list WHERE Drink_ID = %s", (item_id,))
                    result = cursor.fetchone()
                    if result:
                        item_name = result['Drink_Name']

                elif item_type == 'combo':
                    cursor.execute("SELECT Code_Name FROM combo_food_list WHERE Combo_List_ID = %s", (item_id,))
                    result = cursor.fetchone()
                    if result:
                        item_name = result['Code_Name']

                item['Item_Name'] = item_name
                items.append(item)

            customer_id = order['customer_id']

            if customer_id:
                cursor.execute("""
                    SELECT CONCAT(ca.Lname, ', ', ca.Fname, ' ', ca.Mname) AS Customer_Name, 
                               ca.contact_number,
                                        CONCAT(
                                            cl.Street_Address, ', ',
                                            cl.Barangay_Subdivision, ', ',
                                            cl.City_Municipality, ', ',
                                            cl.Province_Region, ' (Landmark: ',
                                            cl.landmark, ')'
                                        ) AS location
                    FROM customer_accounts ca
                    LEFT JOIN customer_locations cl ON ca.customer_id = cl.customer_id
                    WHERE ca.customer_id = %s
                """, (customer_id,))
                result = cursor.fetchone()
                customer_name = result['Customer_Name'] if result else "Unknown"

            else:
                customer_name = "Walk-In Guest"

            orders.append({
                'order_id': order['Or_Logs_ID'],
                'Transaction_ID': order['Transaction_ID'],
                'order_type': order['order_type'],
                'order_time': order['order_time'],
                'status': order['status'],
                'customer': customer_name,
                'items': items
            })


        return render_template('Cashier_delivery_history.html', orders=orders)

    except Exception as e:
        print("Error loading order queue:", e)
        return render_template('Cashier_delivery_history.html', orders=[])

    finally:
        cursor.close()
        conn.close()
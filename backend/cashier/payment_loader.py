from flask import Blueprint, render_template, request, jsonify, session
from backend.dbconnection import create_connection
from backend.cashier.reciepts.print_reciept import print_receipt_by_order_id
from decimal import Decimal, ROUND_UP

cashier_payment_bp = Blueprint('cashier_payment', __name__, url_prefix='/cashier')

PRICE_PER_METER = Decimal('10.00')  # example price per meter for delivery fee, adjust as needed

@cashier_payment_bp.route('/payment_module/<int:order_id>', methods=['GET', 'POST'])
def payment_module(order_id):
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        try:
            payment_method = request.form['paymentMethod']
            cash_given = request.form.get('cashGiven', type=float)
            discount_percent = request.form.get('discountPercent', type=float) or 0.0
            discount_percent = Decimal(discount_percent)
            discount_id = request.form.get("discountID")
            amount_paid = request.form.get("cashGiven")
            change_amount = request.form.get("change")

            # Get order info
            cursor.execute("SELECT * FROM processing_orders WHERE order_ID = %s", (order_id,))
            order = cursor.fetchone()
            if not order:
                cursor.close()
                conn.close()
                return jsonify(status='error', message='Order not found'), 404

            order_type = order['order_type']
            delivery_distance = order.get('delivery_distance') or 0.0

            # Fetch order items
            cursor.execute("SELECT Quantity, Price_Per_Item FROM processing_order_items WHERE order_ID = %s", (order_id,))
            items = cursor.fetchall()
            if not items:
                cursor.close()
                conn.close()
                return jsonify(status='error', message='No order items found'), 400

            total_price = sum(Decimal(item['Price_Per_Item']) * item['Quantity'] for item in items)

            if order_type == 'delivery':
                # Delivery: no discount, delivery fee applied, payment status unpaid
                discount_id = None
                discount_percent = Decimal('0.0')
                delivery_fee = PRICE_PER_METER * Decimal(delivery_distance)
                total_price += delivery_fee

                # No cash validation for delivery (assumed unpaid or online)
                discounted_total = total_price.quantize(Decimal('0.01'), rounding=ROUND_UP)

                # For delivery, payment status is "unpaid"
                payment_status = "unpaid"

            else:
                # dine-in or take-out logic with discount and immediate payment
                if discount_id in [None, 0, '0', '']:
                    discount_id = None

                if discount_id is not None:
                    discounted_total = total_price - (total_price * discount_percent)
                else:
                    discounted_total = total_price

                discounted_total = discounted_total.quantize(Decimal('0.01'), rounding=ROUND_UP)

                if payment_method == 'cash-option' and (cash_given is None or Decimal(cash_given) < discounted_total):
                    cursor.close()
                    conn.close()
                    return jsonify(status='error', message='Insufficient cash provided'), 400

                payment_status = "paid"

            # Get transaction id
            transaction_id = order.get('transaction_id')
            if not transaction_id:
                cursor.close()
                conn.close()
                return jsonify(status='error', message='Missing transaction ID'), 400

            # Log the transaction
            log_result = log_order_transaction(
                order_id,
                discount_id,
                payment_method,
                transaction_id,
                amount_paid,
                change_amount,
                payment_status
            )

            if log_result['status'] == 'success':
                # Update order_status if delivery
                cursor.execute("UPDATE processing_orders SET order_status = 'preparing' WHERE order_ID = %s", (order_id,))
                affected_rows = cursor.rowcount


                print(log_result,order_id)
                print(f"Affected rows: {affected_rows}")
                if affected_rows > 0:
                    conn.commit()
                    cursor.close()
                    conn.close()
                    return jsonify(status='success')
                else:
                    return jsonify(status='error', message='Order ID not found or status not updated')

            else:
                cursor.close()
                conn.close()
                return jsonify(status='error', message=log_result.get('message', 'Unknown error')), 500

        except Exception as e:
            cursor.close()
            conn.close()
            return jsonify(status='error', message=str(e)), 500

    # GET request: load order, items, discounts for payment form (same for all)
    cursor.execute("SELECT * FROM processing_orders WHERE order_ID = %s AND order_status = 'pending'", (order_id,))
    order = cursor.fetchone()

    if not order:
        cursor.close()
        conn.close()
        return "Order not found or already processed", 404

    customer_id = order.get('customer_id')
    if customer_id:
        cursor.execute("SELECT * FROM customer_accounts WHERE customer_id = %s", (customer_id,))
        customer = cursor.fetchone()
        order['customer_name'] = " ".join(filter(None, [customer['Fname'], customer['Mname'], customer['Lname']]))
        order['customer_contact'] = customer['contact_number']

        cursor.execute("SELECT * FROM customer_locations WHERE customer_id = %s", (customer_id,))
        location = cursor.fetchone()
        order['customer_location'] = location['location'] if location else "No saved address"
    else:
        order['customer_name'] = 'Walk-In Guest'
        order['customer_contact'] = ''
        order['customer_location'] = ''

    cursor.execute("SELECT * FROM processing_order_items WHERE order_ID = %s", (order_id,))
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
            cursor.execute("SELECT Dessert_Name FROM Dessert_list WHERE Dessert_ID = %s", (item_id,))
            result = cursor.fetchone()
            if result:
                item_name = result['Dessert_Name']
        elif item_type == 'drink':
            cursor.execute("SELECT Drink_Name FROM drink_list WHERE Drink_ID = %s", (item_id,))
            result = cursor.fetchone()
            if result:
                item_name = result['Drink_Name']
        elif item_type == 'combo':
            cursor.execute("SELECT Code_Name FROM Combo_Food_List WHERE Combo_List_ID = %s", (item_id,))
            result = cursor.fetchone()
            if result:
                item_name = result['Code_Name']

        item['Item_Name'] = item_name
        items.append(item)

    cursor.execute("SELECT Discount_ID, Discount_Name, Discount_Percent FROM Discount_Table")
    discounts = cursor.fetchall()
    
    cursor.execute("""
        SELECT SUM(Total_Item_Price) as 'total_price' 
            FROM `processing_order_items` WHERE order_ID = %s
    """, (order_id,))
    result = cursor.fetchone()
    total_price = result['total_price'] if result['total_price'] else 0.0
    print(f"Total price for order {order_id}: {total_price}")

    cursor.close()
    conn.close()

    return render_template('payment_module.html', order=order, items=items, total_price=total_price, discounts=discounts)


def log_order_transaction(order_id, discount_id, payment_method, transaction_id, amount_paid, change_amount, payment_status):
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM processing_orders WHERE order_ID = %s", (order_id,))
        order = cursor.fetchone()
        if not order:
            raise Exception("Order not found.")

        order_type = order.get('order_type')
        customer_id = order.get('customer_id')
        order_list_id = order.get('order_list_id')
        cashier_id = session.get('user_id')

        cursor.execute("SELECT Quantity, Price_Per_Item FROM processing_order_items WHERE order_ID = %s", (order_id,))
        items = cursor.fetchall()
        total_price = sum(Decimal(item['Price_Per_Item']) * item['Quantity'] for item in items)

        # Discount percent for logging
        if discount_id is not None and discount_id != 0:
            cursor.execute("SELECT Discount_Percent FROM discount_table WHERE Discount_ID = %s", (discount_id,))
            discount_row = cursor.fetchone()
            if discount_row and 'Discount_Percent' in discount_row:
                discount_percent = Decimal(discount_row['Discount_Percent'])
            else:
                raise Exception("Discount not found in discount_table.")
        else:
            discount_id = None
            discount_percent = Decimal('0.0')

        discount_price = (total_price * discount_percent).quantize(Decimal('0.01'), rounding=ROUND_UP)
        discounted_total = (total_price - discount_price).quantize(Decimal('0.01'), rounding=ROUND_UP)

        payment_method_clean = payment_method.replace("-option", "")

        # Use payment_status from caller (paid/unpaid)
        status = payment_status

        cursor.execute("SET @p_or_logs_id = 0")

        cursor.execute("CALL loging_walk_in_order(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, @p_or_logs_id)", (
            order_id,
            transaction_id,
            cashier_id,
            total_price,
            discount_id,
            discounted_total,
            payment_method_clean,
            order_type,
            customer_id,
            status,
        ))

        cursor.execute("SELECT @p_or_logs_id AS or_logs_id")
        result = cursor.fetchone()
        or_logs_id = result['or_logs_id'] if result else None

        if not or_logs_id:
            raise Exception("Failed to get Ordered_Logs ID.")

        cursor.callproc('log_order_items', (order_list_id, or_logs_id))
        conn.commit()

        return {'status': 'success'}

    except Exception as e:
        conn.rollback()
        return {'status': 'error', 'message': str(e)}

    finally:
        cursor.close()
        conn.close()
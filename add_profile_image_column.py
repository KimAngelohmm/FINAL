"""
Script to add profile_image column to customer_accounts table if it doesn't exist.
"""
from backend.dbconnection import create_connection

def add_profile_image_column():
    conn = None
    cursor = None
    
    try:
        print("Connecting to database...")
        conn = create_connection()
        if not conn:
            print("Failed to connect to database")
            return False

        cursor = conn.cursor(dictionary=True)
        
        # Check if column exists
        print("Checking if profile_image column exists in customer_accounts...")
        cursor.execute("SHOW COLUMNS FROM customer_accounts LIKE 'profile_image'")
        result = cursor.fetchone()
        
        if result:
            print("profile_image column already exists in customer_accounts table")
            return True
            
        # Add the column if it doesn't exist
        print("Adding profile_image column to customer_accounts table...")
        cursor.execute("ALTER TABLE customer_accounts ADD COLUMN profile_image LONGBLOB")
        conn.commit()
        print("Column added successfully")
        return True
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return False
        
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    result = add_profile_image_column()
    print(f"Operation {'successful' if result else 'failed'}") 
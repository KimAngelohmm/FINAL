from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
import json
import os

about_us_bp = Blueprint('about_us_bp', __name__)

# File path to store about us content
ABOUT_US_FILE = 'static/data/about_us.json'

# Default content
DEFAULT_CONTENT = {
    "story": "Any-Haw Litson Manok was founded in 2020 with a passion for delivering the best Litson Manok in town. Our journey began with a family recipe passed down through generations, perfected over time to create the most delicious and flavorful roasted chicken.",
    "mission": "To provide our customers with high-quality, flavorful Filipino cuisine at affordable prices while maintaining excellent customer service and a welcoming atmosphere.",
    "vision": "To become the leading Litson Manok brand known for quality, consistency, and authentic Filipino flavors, expanding our reach across the country while staying true to our family recipes and values."
}

# Ensure the data directory exists
def ensure_data_dir():
    os.makedirs('static/data', exist_ok=True)

# Get about us content from file or use default
def get_about_us_content():
    ensure_data_dir()
    try:
        if os.path.exists(ABOUT_US_FILE):
            with open(ABOUT_US_FILE, 'r') as file:
                return json.load(file)
        else:
            # If file doesn't exist, create it with default content
            with open(ABOUT_US_FILE, 'w') as file:
                json.dump(DEFAULT_CONTENT, file, indent=4)
            return DEFAULT_CONTENT
    except Exception as e:
        print(f"Error reading about us content: {e}")
        return DEFAULT_CONTENT

# Save about us content to file
def save_about_us_content(content):
    ensure_data_dir()
    try:
        with open(ABOUT_US_FILE, 'w') as file:
            json.dump(content, file, indent=4)
        return True
    except Exception as e:
        print(f"Error saving about us content: {e}")
        return False

@about_us_bp.route('/about_us')
def about_us():
    # Check if user is authenticated and has admin role
    if 'user_id' in session and 'role' in session and session['role'].lower() == 'admin':
        about_us_content = get_about_us_content()
        return render_template('about_us.html', content=about_us_content)
    else:
        # Redirect to login if not authenticated or not an admin
        return redirect(url_for('Index_home'))

@about_us_bp.route('/api/update-about-us', methods=['POST'])
def update_about_us():
    # Check if user is authenticated and has admin role
    if 'user_id' in session and 'role' in session and session['role'].lower() == 'admin':
        try:
            data = request.json
            content = {
                'story': data.get('story', DEFAULT_CONTENT['story']),
                'mission': data.get('mission', DEFAULT_CONTENT['mission']),
                'vision': data.get('vision', DEFAULT_CONTENT['vision'])
            }
            
            if save_about_us_content(content):
                return jsonify({"success": True, "message": "About Us content updated successfully"})
            else:
                return jsonify({"success": False, "message": "Failed to update About Us content"}), 500
        except Exception as e:
            print(f"Error in update_about_us: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Unauthorized"}), 401 
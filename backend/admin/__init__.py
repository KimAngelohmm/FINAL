# Admin module initialization
# This makes the admin directory a proper Python package 

from flask import Blueprint

admin_bp = Blueprint('admin_bp', __name__)

# Import routes
from backend.admin.admin_dashboard_loader import admin_dashboard_bp
from backend.admin.admin_manage_menu_loader import admin_menu_bp
from backend.admin.admin_manage_account_loader import admin_accounts_bp
from backend.admin.about_us_loader import about_us_bp

# Register blueprints
admin_bp.register_blueprint(admin_dashboard_bp)
admin_bp.register_blueprint(admin_menu_bp)
admin_bp.register_blueprint(admin_accounts_bp)
admin_bp.register_blueprint(about_us_bp)

# Define additional routes if needed
@admin_bp.route('/admin')
def admin_home():
    return admin_dashboard_bp.load_dashboard() 
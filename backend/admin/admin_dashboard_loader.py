from flask import Blueprint, render_template

admin_dashboard_bp = Blueprint('admin_dashboard_bp', __name__)

@admin_dashboard_bp.route('/admin/dashboard')
def load_dashboard():
    return render_template('admin_dashboard.html') 
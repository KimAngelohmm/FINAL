from flask import Blueprint, render_template

admin_menu_bp = Blueprint('admin_menu_bp', __name__)

@admin_menu_bp.route('/admin/manage-menu')
def manage_menu():
    return render_template('admin_manage_menu.html')

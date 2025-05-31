from flask import Blueprint, render_template

admin_accounts_bp = Blueprint('admin_accounts_bp', __name__)

@admin_accounts_bp.route('/admin/manage-accounts')
def manage_accounts():
    return render_template('admin_manage_accounts.html')

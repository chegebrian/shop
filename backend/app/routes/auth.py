from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/health', methods=['GET'])
def health():
    return jsonify({'message': 'Auth routes working! ✅'}), 200
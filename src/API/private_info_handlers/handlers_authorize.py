from src.API.app import app
from flask import  request, jsonify

from src.config import getAdm, getEditor

# Функция входа
@app.route('/api/v1/auth', methods=['GET'])
def getAuth_api():
    try:
        site = request.args.get('site')
        code = request.args.get('code')
    except Exception as e:
        return jsonify([e]), 500

    if site is None or code is None:
        return jsonify('Invalid or missing args'), 400

    if site.lower() == 'news':
        if getAdm() == code or getEditor() == code:
            return jsonify(True), 200
        else:
            return jsonify(False), 200

    if site.lower() == 'analytics':
        if getAdm() == code:
            return jsonify(True), 200
        else:
            return jsonify(False), 200

    return jsonify(False), 200
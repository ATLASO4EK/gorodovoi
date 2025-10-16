from flask import request, jsonify
from src.API.app import app

from src.Database.private_tg_bot.DB_private_tg_users import *

@app.route('/api/v1/private_tg/users', methods=['POST'])
def postUsers_api_private():
    try:
        tg_id=int(request.args.get('tg_id'))
    except Exception as e:
        return jsonify(e), 400

    try:
        data = postPrivateTg(tg_id)
    except Exception as e:
        return jsonify(e), 500

    return jsonify(data), 200

@app.route('/api/v1/private_tg/users', methods=['GET'])
def getUsers_api_private():
    try:
        id_int = request.args.get('id')
        tg_id = request.args.get('tg_id')
    except Exception as e:
        return jsonify(e), 400

    try:
        data=getPrivateTg(id_int, tg_id)
    except Exception as e:
        return jsonify(e), 500

    return jsonify(data), 200

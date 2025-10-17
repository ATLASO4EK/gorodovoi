from flask import request, jsonify
from src.API.app import app

from src.Database.tg_bot.DB_private_tg import *

@app.route('/api/v1/private/tg', methods=['GET'])
def get_private_Users_api():
    try:
        suc, data = get_users()

        if suc:
            return jsonify(data), 200
        elif not suc:
            return jsonify(str(data)), 500
        else:
            return jsonify('Unexpected Error has occurred'), 500
    except Exception as e:
        print(e)
        return jsonify(str(e)), 500


@app.route('/api/v1/private/tg', methods=['POST'])
def post_private_Users_api():
    try:
        tg_id = int(request.args.get('tg_id'))
    except Exception as e:
        print(e)
        return jsonify(str(e)), 400

    try:
        suc, data = post_users(tg_id)

        if suc:
            return jsonify(data), 200
        elif not suc:
            return jsonify(str(data)), 500
        else:
            return jsonify('Unexpected Error has occurred'), 500
    except Exception as e:
        print(e)
        return jsonify(str(e)), 500
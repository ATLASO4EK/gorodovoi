from flask import request, jsonify
from src.API.app import app

from src.Database.tg_bot.tg_bot import *

@app.route('/api/v1/tg', methods=['GET'])
def getUsers_api():
    # Получаем данные из запроса
    try:
        id_int = request.args.get('id_int')
        tg_id = request.args.get('tg_id')
        isnotifon = request.args.get('isnotifon')
    except Exception as e:
        return jsonify(e), 400

    # Получаем и возвращаем данные из БД
    try:
        data = getTg(id_int, tg_id, isnotifon)
    except Exception as e:
        return jsonify(e), 500

    return jsonify(data), 200

@app.route('/api/v1/tg', methods=['POST'])
def postUsers_api():
    # Получаем данные из запроса
    try:
        tg_id = int(request.args.get('tg_id'))
        isnotifon = str(request.args.get('isnotifon'))
    except Exception as e:
        return jsonify(e), 400
    print(tg_id)
    print(isnotifon)
    if tg_id is None or isnotifon is None:
        return jsonify('More args expected'), 400

    # Получаем и возвращаем данные из БД
    try:
        data = postTg(tg_id, isnotifon)
    except Exception as e:
        return jsonify(e), 500

    return jsonify(data), 200

@app.route('/api/v1/tg', methods=['PUT'])
def putUsers_api():
    # Получаем данные из запроса
    try:
        tg_id = request.args.get('tg_id')
        isnotifon = request.args.get('isnotifon')
    except Exception as e:
        return jsonify(e), 400

    # Проверяем данные из запроса
    if tg_id is None or isnotifon is None:
        return jsonify('More args expected'), 400

    # Получаем и возвращаем данные из БД
    try:
        data = getTg(tg_id, isnotifon)
    except Exception as e:
        return jsonify(e), 500

    return jsonify(data), 200
from src.API.app import app
from flask import  request, jsonify
import datetime

from src.Database.trucks_traffic.DB_realtime_routes import get_routes

@app.route('/api/v1/tracks_traffic/realtime_routes', methods=['GET'])
def get_routes_api():
    try:
        identificator = str(request.args.get('identificator')) if request.args.get('identificator') is not None else None
    except Exception as e:
        print(e)
        return jsonify(str(e)), 400

    try:
        suc, data = get_routes(identificator=identificator)
        if suc:
            return jsonify(data), 200
        if not suc:
            return jsonify(str(data)), 500
        else:
            return jsonify('Unexpected Error has occurred'), 500
    except Exception as e:
        print(e)
        return jsonify(e), 500
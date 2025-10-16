from src.API.app import app
from flask import  request, jsonify
import datetime

from src.Database.trucks_traffic.DB_trucks_traffic import get_detectors, post_detector

@app.route('/api/v1/trucks_traffic/detectors')
def get_detectors_api():
    try:
        name = str(request.args.get('name')) if request.args.get('name') is not None else None
    except Exception as e:
        print(e)
        return jsonify(str(e)), 400

    try:
        suc, data = get_detectors(name=name)

        if suc:
            return jsonify(data), 200
        elif not suc:
            return jsonify(str(data)), 500
        else:
            return jsonify('Unexpected error occurred'), 500

    except Exception as e:
        print(e)
        return jsonify(str(e)), 500
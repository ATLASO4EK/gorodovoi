from src.API.app import app
from flask import  request, jsonify
import datetime

from src.Database.trucks_traffic.DB_tracks_traffic import get_detectors, post_detector

@app.route('/api/v1/tracks_traffic/detectors', methods=['GET'])
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

@app.route('/api/v1/tracks_traffic/detectors', methods=['POST'])
def post_detector_api():
    try:
        name = str(request.args.get('name'))
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))
    except Exception as e:
        print(e)
        return jsonify(str(e)), 400

    try:
        suc, data= post_detector(name=name,
                      lat=lat,
                      lon=lon)

        if suc:
            return jsonify(suc), 200
        elif not suc:
            return jsonify(str(data)), 500
        else:
            return jsonify('Unexpected error occurred'), 500

    except Exception as e:
        print(e)
        return jsonify(str(e)), 500
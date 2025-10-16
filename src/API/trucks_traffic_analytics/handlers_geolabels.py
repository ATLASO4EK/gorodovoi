from src.API.app import app
from flask import  request, jsonify
import datetime

from src.Database.trucks_traffic.DB_trucks_traffic import get_detectors, post_detector

@app.route('/api/v1/trucks_traffic/detectors')
def get_detectors_api():
    try:
        name = 11
    except Exception as e:
        print(e)
        return jsonify(str(e)), 400
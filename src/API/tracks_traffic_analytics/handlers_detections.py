from src.API.app import app
from flask import  request, jsonify
import datetime

from src.Database.trucks_traffic.DB_cars_detections import post_detection
from src.Database.trucks_traffic.DB_realtime_routes import get_routes, put_route, post_route

@app.route('/api/v1/tracks_traffic/detections', methods=['POST'])
def post_detection_api():
    try:
        detector = str(request.args.get('detector'))
        labeltime = datetime.datetime.now()
        identificator = str(request.args.get('identificator'))
        speedtime = float(request.args.get('speedtime'))
    except Exception as e:
        print(e)
        return jsonify(str(e)), 400

    try:
        post_detection(detector=detector,
                       labeltime=labeltime,
                       identificator=identificator,
                       speedtime=speedtime)
        iden_route = get_routes(identificator)
        if iden_route[1] == []:
            post_route(identificator=identificator,
                       route=[detector])
        elif iden_route[1] != []:
            new_route = iden_route[1][0][2] + ',' + str(detector)
            new_route = new_route.split(sep=',')
            put_route(identificator=identificator,
                      route=new_route)
        else:
            return jsonify(str('Unexpected Error has occurred')), 500

        return jsonify(True), 200
    except Exception as e:
        print(e)
        return jsonify(str(e)), 500
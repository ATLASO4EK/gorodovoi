import datetime as dt
from src.API.app import app
from flask import request, jsonify
from src.Database.trucks_traffic.DB_clustering import get_top_routes, get_top_routes_pair

@app.route("/api/v1/tracks_traffic/clustering", methods=["GET"])
def api_top_routes():
    try:
        start = dt.datetime.fromisoformat(request.args["start_ts"])
        end = dt.datetime.fromisoformat(request.args["end_ts"])
        top_n = int(request.args.get("top_n", 10))
        eps = float(request.args.get("eps", 0.0005))
        sim = float(request.args.get("similarity_threshold", 0.65))
    except Exception as e:
        return jsonify({"ok": False, "error": f"Bad params: {e}"}), 400

    try:
        data = get_top_routes(start, end, top_n, eps, sim)
        return jsonify({"ok": True, "data": data}), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/api/v1/tracks_traffic/clustering-pair", methods=["GET"])
def api_top_routes_pair():
    try:
        start_a = dt.datetime.fromisoformat(request.args["start_a"])
        end_a = dt.datetime.fromisoformat(request.args["end_a"])
        start_b = dt.datetime.fromisoformat(request.args["start_b"])
        end_b = dt.datetime.fromisoformat(request.args["end_b"])
        top_n = int(request.args.get("top_n", 10))
        eps = float(request.args.get("eps", 0.0005))
        sim = float(request.args.get("similarity_threshold", 0.65))
    except Exception as e:
        return jsonify({"ok": False, "error": f"Bad params: {e}"}), 400

    try:
        data = get_top_routes_pair(start_a, end_a, start_b, end_b, top_n, eps, sim)
        return jsonify({"ok": True, "data": data}), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

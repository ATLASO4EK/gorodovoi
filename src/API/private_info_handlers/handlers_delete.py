from flask import request, jsonify
import datetime

from src.API.app import app
from src.Database.cityops.delete_cityops import deleteEvacuateByDate, deleteFines, deleteMVD


@app.route('/api/v1/EvacuationStats', methods=['DELETE'])
def deleteEvacuation_api():
    event_date_str = request.args.get("event_date")
    if not event_date_str:
        return jsonify({"ok": False, "error": "event_date обязателен"}), 400
    try:
        event_date = datetime.datetime.strptime(event_date_str, "%Y-%m-%d").date()
    except Exception:
        return jsonify({"ok": False, "error": "Неверный формат event_date"}), 400
    ok, err = deleteEvacuateByDate(event_date)
    if not ok:
        return jsonify({"ok": False, "error": err}), 404
    return jsonify({"ok": True}), 200


@app.route('/api/v1/Fines/<int:row_id>', methods=['DELETE'])
def deleteFines_api(row_id: int):
    ok, err = deleteFines(row_id)
    if not ok:
        return jsonify({"ok": False, "error": err}), 404
    return jsonify({"ok": True}), 200


@app.route('/api/v1/MVD/<int:row_id>', methods=['DELETE'])
def deleteMVD_api(row_id: int):
    ok, err = deleteMVD(row_id)
    if not ok:
        return jsonify({"ok": False, "error": err}), 404
    return jsonify({"ok": True}), 200

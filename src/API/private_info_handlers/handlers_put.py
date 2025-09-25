from flask import request, jsonify
import datetime

from src.API.app import app
from src.Database.cityops.put_cityops import putEvacuateByDate, putFines, putMVD


@app.route('/api/v1/EvacuationStats', methods=['PUT'])
def putEvacuation_api():
    body = request.get_json(silent=True) or {}
    event_date_str = body.get("event_date")
    if not event_date_str:
        return jsonify({"ok": False, "error": "event_date обязателен"}), 400
    try:
        event_date = datetime.datetime.strptime(event_date_str, "%Y-%m-%d").date()
    except Exception:
        return jsonify({"ok": False, "error": "Неверный формат event_date"}), 400
    ok, err = putEvacuateByDate(
        event_date,
        tow_trucks_on_line=body.get("tow_trucks_on_line"),
        trips_count=body.get("trips_count"),
        evacuations_count=body.get("evacuations_count"),
        impound_revenue_rub=body.get("impound_revenue_rub"),
        upsert=body.get("upsert", False)
    )
    if not ok:
        return jsonify({"ok": False, "error": err}), 404
    return jsonify({"ok": True}), 200


@app.route('/api/v1/Fines/<int:row_id>', methods=['PUT'])
def putFines_api(row_id: int):
    body = request.get_json(silent=True) or {}
    date_str = body.get("report_date")
    report_date = None
    if date_str:
        try:
            report_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except Exception:
            return jsonify({"ok": False, "error": "Неверный формат report_date"}), 400
    ok, err = putFines(
        row_id,
        report_date=report_date,
        cams_violations_cum=body.get("cams_violations_cum"),
        decisions_cum=body.get("decisions_cum"),
        fines_sum_cum=body.get("fines_sum_cum"),
        collected_sum_cum=body.get("collected_sum_cum")
    )
    if not ok:
        return jsonify({"ok": False, "error": err}), 404
    return jsonify({"ok": True}), 200


@app.route('/api/v1/MVD/<int:row_id>', methods=['PUT'])
def putMVD_api(row_id: int):
    body = request.get_json(silent=True) or {}
    start_str = body.get("period_start")
    end_str = body.get("period_end")
    period_start, period_end = None, None
    if start_str:
        try:
            period_start = datetime.datetime.strptime(start_str, "%Y-%m-%d").date()
        except Exception:
            return jsonify({"ok": False, "error": "Неверный формат period_start"}), 400
    if end_str:
        try:
            period_end = datetime.datetime.strptime(end_str, "%Y-%m-%d").date()
        except Exception:
            return jsonify({"ok": False, "error": "Неверный формат period_end"}), 400
    ok, err = putMVD(
        row_id,
        period_label=body.get("period_label"),
        region=body.get("region"),
        period_start=period_start,
        period_end=period_end,
        crashes_with_victims=body.get("crashes_with_victims"),
        deaths=body.get("deaths"),
        injuries=body.get("injuries"),
        deaths_per_100_victims=body.get("deaths_per_100_victims")
    )
    if not ok:
        return jsonify({"ok": False, "error": err}), 404
    return jsonify({"ok": True}), 200

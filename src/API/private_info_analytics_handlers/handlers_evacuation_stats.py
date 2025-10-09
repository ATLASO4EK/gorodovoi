import datetime
from flask import request, jsonify

from src.Database.cityops.get_cityops import getEvacuationStats
from src.Database.cityops.post_cityops import postEvacuate
from src.Database.cityops.put_cityops import putEvacuateByDate
from src.Database.cityops.delete_cityops import deleteEvacuateByDate
from src.API.app import app

@app.route('/api/v1/EvacuationStats', methods=['GET'])
def getEvacuationStats_api():
    """
    Возвращает данные из БД с указанными в запросе фильтрами
    """
    date = request.args.get('date')         # date in format YYYY-MM-DD
    print(date)
    try:
        date = datetime.datetime.strptime(date, "%Y-%m-%d")
    except:
        date = None
    print(date)
    date_end = request.args.get('date_end')         # date in format YYYY-MM-DD
    try:
        date_end = datetime.datetime.strptime(date_end, "%Y-%m-%d")
    except:
        date_end = None

    data = getEvacuationStats(
        date,
        date_end
    )
    ans = jsonify(list(map(list, data)))

    return ans, 200

@app.route('/api/v1/EvacuationStats', methods=['POST'])
def postEvacuate_api():
    """
    Запрос, при помощи которого можно добавить в БД данные о дневной эвакуации
    :return: True если удачно
    """
    try:
        date = datetime.datetime.strptime(request.args.get('date'), "%Y-%m-%d")   # date in format YYYY-MM-DD
        trucks_num = int(request.args.get('trucks_num'))     # int
        trips_num = int(request.args.get('trips_num'))      # int
        evac_num = int(request.args.get('evac_num'))        # int
        rev_rub = float(request.args.get('revenue_rub'))    # float or decimal
    except Exception as e:
        ans = jsonify('Incorrect type of incoming args')
        return ans, 400

    try:
        status, e = postEvacuate(
            date = date,
            trucks_num = trucks_num,
            trips_num = trips_num,
            evac_num = evac_num,
            rev_rub = rev_rub
        )
        if status:
            ans = jsonify(True)
            return ans, 200
        else:
            ans = jsonify(["Internal SQL-server error, can't post data", e])
            return ans, 500

    except Exception as e:
        ans = jsonify(["Internal server error, can't post data", e])
        return ans, 500

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
import datetime
from flask import request, jsonify

from src.Database.cityops.get_cityops import getMVDStats
from src.Database.cityops.post_cityops import postMVD
from src.Database.cityops.put_cityops import putMVD
from src.Database.cityops.delete_cityops import deleteMVD
from src.API.app import app

@app.route('/api/v1/MVDStats', methods=['GET'])
def getMVDStats_api():
    """
    Возвращает данные из БД с указанными в запросе фильтрами
    """
    data = getMVDStats()

    ans = jsonify(list(map(list, data)))
    return ans, 200

@app.route('/api/v1/MVDStats', methods=['POST'])
def postMVD_api():
    """
    Запрос, при помощи которого можно добавить в БД данные от МВД
    :return: True если удачно
    """
    try:
        date_start = datetime.datetime.strptime(request.args.get('date_start'), "%Y-%m-%d")   # date in format YYYY-MM-DD
        date_end = datetime.datetime.strptime(request.args.get('date_end'), "%Y-%m-%d")   # date in format YYYY-MM-DD
        period_text = request.args.get('period_text')    # текстовое описание периода (необязательное), str
        region = request.args.get('region')    # текстовое описание региона (необязательное), str
        crashes = float(request.args.get('crashes'))      # int
        deaths = float(request.args.get('deaths'))        # int
        injuries = float(request.args.get('injuries'))        # int
    except:
        ans = jsonify('Incorrect type of incoming args')
        return ans, 400

    if period_text is None:
        period_text = f'{date_start.month}.{date_start.year} - {date_end.month}.{date_end.year}'
    try:
        postMVD(
            date_start = date_start,
            date_end = date_end,
            period_text = period_text,
            region = region,
            crashes = int(crashes),
            deaths = int(deaths),
            injuries = int(injuries),
            death_stat = (deaths/crashes)*100
        )

        ans = jsonify(True)
        return ans, 200
    except:
        ans = jsonify("Internal SQL-server error, can't post data")
        return ans, 500

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

@app.route('/api/v1/MVD/<int:row_id>', methods=['DELETE'])
def deleteMVD_api(row_id: int):
    ok, err = deleteMVD(row_id)
    if not ok:
        return jsonify({"ok": False, "error": err}), 404
    return jsonify({"ok": True}), 200
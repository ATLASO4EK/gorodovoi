import datetime
from flask import request, jsonify

from src.Database.cityops.get_cityops import getFinesStats
from src.Database.cityops.post_cityops import postFines
from src.Database.cityops.put_cityops import putFines
from src.Database.cityops.delete_cityops import deleteFines
from src.API.app import app

@app.route('/api/v1/FinesStats', methods=['GET'])
def getFinesStats_api():
    """
    Возвращает данные из БД с указанными в запросе фильтрами
    """
    date = request.args.get('date')
    try:
        date = datetime.datetime.strptime(date, "%Y-%m-%d")
    except:
        date = None

    date_end = request.args.get('date_end')
    try:
        date_end = datetime.datetime.strptime(date_end, "%Y-%m-%d")
    except:
        date_end= None

    cam_lownum = request.args.get('cam_lownum')
    cam_maxnum = request.args.get('cam_maxnum')
    dec_lownum = request.args.get('dec_lownum')
    dec_maxnum = request.args.get('dec_maxnum')
    fines_lownum = request.args.get('fines_lownum')
    fines_maxnum = request.args.get('fines_maxnum')
    got_minnum = request.args.get('got_minnum')
    got_maxnum = request.args.get('got_maxnum')


    data = getFinesStats(
                  date,
                  date_end,
                  cam_lownum,
                  cam_maxnum,
                  dec_lownum,
                  dec_maxnum,
                  fines_lownum,
                  fines_maxnum,
                  got_minnum,
                  got_maxnum
    )

    ans = jsonify(list(map(list, data)))
    return ans, 200

@app.route('/api/v1/FinesStats', methods=['POST'])
def postFines_api():
    """
    Запрос, при помощи которого можно добавить в БД данные о штрафах
    :return: True если удачно
    """
    try:
        date = datetime.datetime.strptime(request.args.get('date'), "%Y-%m-%d")   # date in format YYYY-MM-DD
        cam_vial = int(request.args.get('cam_vial'))      # int
        decisions = int(request.args.get('decisions'))        # int
        fines_sum = float(request.args.get('fines_sum'))        # float
        collected_sum = float(request.args.get('collected_sum'))        # float
    except:
        ans = jsonify('Incorrect type of incoming args')
        return ans, 400

    try:
        postFines(
            date = date,
            cam_vial = cam_vial,
            decisions = decisions,
            fines_sum = fines_sum,
            collected_sum = collected_sum
        )

        ans = jsonify(True)
        return ans, 200
    except:
        ans = jsonify("Internal server error, can't post data")
        return ans, 500

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

@app.route('/api/v1/Fines/<int:row_id>', methods=['DELETE'])
def deleteFines_api(row_id: int):
    ok, err = deleteFines(row_id)
    if not ok:
        return jsonify({"ok": False, "error": err}), 404
    return jsonify({"ok": True}), 200
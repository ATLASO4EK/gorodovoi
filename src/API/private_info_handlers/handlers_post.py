from flask import request, jsonify

from src.Database.cityops.post_cityops import *
from src.API.app import app

# Пост скрытых данных об эвакуации
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

# Пост скрытых данных от МВД
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

# Пост скрытых данных о штрафах
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
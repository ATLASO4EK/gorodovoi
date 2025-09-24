from flask import request, jsonify

from src.Database.getmethods import *
from src.Database.postmethods import *
from app import app

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

@app.route('/api/v1/MVDStats', methods=['GET'])
def getMVDStats_api():
    """
    Возвращает данные из БД с указанными в запросе фильтрами
    """
    data = getMVDStats()

    ans = jsonify(list(map(list, data)))
    return ans, 200

@app.route('/api/v1/EvacuationStats', methods=['GET'])
def getEvacuationStats_api():
    """
    Возвращает данные из БД с указанными в запросе фильтрами
    """
    date = request.args.get('date')         # date in format YYYY-MM-DD
    try:
        date = datetime.datetime.strptime(date, "%Y-%m-%d")
    except:
        date = None

    date_end = request.args.get('date_end')         # date in format YYYY-MM-DD
    try:
        date_end = datetime.datetime.strptime(date_end, "%Y-%m-%d")
    except:
        date_end = None

    data = getEvacuationStats()
    ans = jsonify(list(map(list, data)))

    return ans, 200


# POST - methods
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
    except:
        ans = jsonify('Incorrect type of incoming args')
        return ans, 400

    try:
        suc, _ = postEvacute(
            date = date,
            trucks_num = trucks_num,
            trips_num = trips_num,
            evac_num = evac_num,
            rev_rub = rev_rub
        )
        if suc:
            ans = jsonify(True)
            return ans, 200
        else:
            ans = jsonify("Internal SQL-server error, can't post data")
            return ans, 500
    except:
        ans = jsonify("Internal server error, can't post data")
        return ans, 500

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
        crashes = float(request.args.get('crashes'))      # int
        deaths = float(request.args.get('deaths'))        # int
        injuries = float(request.args.get('injuries'))        # int
    except:
        ans = jsonify('Incorrect type of incoming args')
        return ans, 400

    if period_text is None:
        period_text = f'{date_start.month} - {date_end.month}.{date_end.year}'
    try:
        postMVD(
            date_start = date_start,
            date_end = date_end,
            period_text = period_text,
            crashes = int(crashes),
            deaths = int(deaths),
            injuries = int(injuries),
            death_stat = (deaths/crashes)*100
        )

        ans = jsonify(True)
        return ans, 200
    except:
        ans = jsonify("Internal server error, can't post data")
        return ans, 500

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
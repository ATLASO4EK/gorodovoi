from flask import request, jsonify

from src.Database.getmethods import *
from src.Database.postmethods import *
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
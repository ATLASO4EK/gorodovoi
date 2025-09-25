import pandas as pd
import datetime
from flask import request, jsonify

from src.Database.cityops.get_cityops import getFinesStats
from src.API.app import app

@app.route('/api/v1/analytics', methods=['GET'])
def getAnalytics():
    try:
        table = str(request.args.get('table'))
        date_start = request.args.get('date_start')
        date_end = request.args.get('date_end')
    except:
        ans = jsonify('Invalid parameters')
        return ans, 500

    if table is None:
        ans = jsonify('Invalid parameters')
        return ans, 500

    if date_start is not None:
        date_start = datetime.datetime.strptime(date_start, "%Y-%m-%d")
    if date_start is not None and date_end is not None:
        date_end = datetime.datetime.strptime(date_end, "%Y-%m-%d")

    if table == 'fines':
        data = getFinesStats(date=date_start, date_end=date_end)
        df = pd.DataFrame(columns=['date', 'cam_vial', 'decisions', 'fines_sum', 'collected_sum'], data = data)
        del data
        # sum
        sum_cam = df['cam_vial'].sum().item()
        sum_des = df['decisions'].sum().item()
        sum_fin = df['finec_sum'].sum().item()
        sum_col = df['collected_sum'].sum().item()

        # percents
        per_col = (sum_col/sum_fin)*100
        per_cam_right = (sum_cam/sum_des)*100
        avg_fin_des = (sum_fin/sum_des)

        return jsonify((sum_cam, sum_des, sum_fin, sum_col, per_col, per_cam_right, avg_fin_des)), 200




    else:
        return jsonify('Incorrect table name'), 400
import pandas as pd
import datetime
from flask import request, jsonify

from src.Database.cityops.get_cityops import getFinesStats, getEvacuationStats
from src.API.app import app

@app.route('/api/v1/analytics', methods=['GET'])
def getAnalytics_api():
    # Получаем данные из запроса
    try:
        table = str(request.args.get('table'))
        date_start = request.args.get('date_start')
        date_end = request.args.get('date_end')
    except:
        ans = jsonify('Invalid parameters')
        return ans, 500

    # Проверяем данные из запроса
    if table is None:
        ans = jsonify('Invalid parameters')
        return ans, 500

    # Преобразуем даты в формат datetime.datetime
    if date_start is not None:
        date_start = datetime.datetime.strptime(date_start, "%Y-%m-%d")
    if date_start is not None and date_end is not None:
        date_end = datetime.datetime.strptime(date_end, "%Y-%m-%d")

    # В зависимости от выбранной таблицы получаем, вычисляем и возвращаем нужные данные
    if table.lower() == 'fines':
        data = getFinesStats(date=date_start, date_end=date_end)
        df = pd.DataFrame(columns=['id','date', 'cam_vial', 'decisions', 'fines_sum', 'collected_sum'], data = data)
        df[['fines_sum', 'collected_sum']] = df[['fines_sum', 'collected_sum']].astype(float)
        del data

        # sum
        sum_cam = df['cam_vial'].sum().item()
        sum_des = df['decisions'].sum().item()
        sum_fin = df['fines_sum'].sum().item()
        sum_col = df['collected_sum'].sum().item()

        # percents
        try:
            per_col = (sum_col/sum_fin)*100
        except:
            per_col = 0.0
        try:
            per_cam_right = (sum_cam/sum_des)*100
        except:
            per_cam_right = 0.0
        try:
            avg_fin_des = (sum_fin/sum_des)
        except:
            avg_fin_des = 0.0

        return jsonify({'sum_cam':sum_cam, 'sum_des':sum_des, 'sum_fin':sum_fin,
                        'sum_col':sum_col, 'per_col':per_col,
                        'per_cam_right':per_cam_right, 'avg_fin_des':avg_fin_des}), 200

    elif table.lower() == 'evacuate':
        try:
            data = getEvacuationStats(date=date_start, date_end=date_end)
        except Exception as e:
            return jsonify(e), 500

        df = pd.DataFrame(columns=['event_date', 'tow_trucks_on_line', 'trips_count', 'evacuations_count', 'impound_revenue_rub'], data = data)
        df[['tow_trucks_on_line', 'trips_count', 'evacuations_count', 'impound_revenue_rub']] = df[['tow_trucks_on_line', 'trips_count', 'evacuations_count', 'impound_revenue_rub']].astype(float)
        del data

        # sum
        sum_trip = df['trips_count'].sum().item()
        sum_evac = df['evacuations_count'].sum().item()
        sum_rev = df['impound_revenue_rub'].sum().item()

        # percents
        try:
            per_evac = (sum_evac/sum_trip)*100
        except:
            per_evac = 0.0
        try:
            avg_rev = (sum_rev/sum_evac)
        except:
            avg_rev = 0.0

        return jsonify({'sum_trip':sum_trip, 'sum_evac':sum_evac,
                        'sum_rev':sum_rev, 'per_evac':per_evac, 'avg_rev':avg_rev}), 200

    else:

        # Если название таблицы указано неверно, то возвращаем ошибку
        return jsonify('Incorrect table name'), 400
import datetime
import numpy as np
from flask import request, jsonify
import pickle
from sklearn.ensemble import RandomForestRegressor

from src.API.app import app
from src.ML.jams_pred.data_gen import weekday


@app.route('/api/v1/jams', methods=['GET'])
def getJams_api():
    try:
        now_date = datetime.datetime.now()
        holidays = ['12-31', '1-1', '5-9', '2-23', '3-8', '5-1', '5-2', '5-3', '6-12', '6-13']

        jams = []
        for i in range(4):
            date = now_date + datetime.timedelta(hours=i)
            model = pickle.load(open('src/API/ML_handlers/model.pickle', 'rb'))
            weekday = np.eye(7)[date.weekday()]
            hour = date.hour/23
            m_d = f'{date.month}-{date.day}'
            holiday = 1.0 if m_d in holidays else 0.0

            jams.append([date.hour, round(model.predict([[hour, weekday[0], weekday[1], weekday[2], weekday[3], weekday[4], weekday[5], weekday[6], holiday]]).item()*10)])

        return jsonify(jams), 200
    except Exception as e:
        return jsonify(e), 500
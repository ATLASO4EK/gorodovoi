import pandas as pd
from flask import request, jsonify

from src.API.app import app

@app.route('/api/v1/analytics', methods=['GET'])
def getAnalytics():
    pass
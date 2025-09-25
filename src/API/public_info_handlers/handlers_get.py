from src.API.app import app
from flask import  request, jsonify

from src.Database.news.get_news import getFullNews, getLastNews, getLastNews_tg

@app.route('/api/v1/News', methods=['GET'])
def getNews_api():
    try:
        filters = request.args.get('filters')
    except:
        ans = jsonify('Incorrect args')
        return ans, 400

    if filters == 'last':
        try:
            return jsonify(getLastNews()), 200
        except Exception as e:
            print(e)
            return jsonify(e), 500

    if filters == 'tg':
        try:
            return jsonify(getLastNews_tg()), 200
        except Exception as e:
            print(e)
            return jsonify(e), 500

    if filters is None:
        try:
            return jsonify(getFullNews()), 200
        except Exception as e:
            print(e)
            return jsonify(e), 500

    return jsonify('Unknown error was occurred'), 500


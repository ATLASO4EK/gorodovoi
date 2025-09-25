from crypt import methods

from src.API.app import app
from flask import  request, jsonify

from src.Database.news.delete_news import delNews

@app.route('/api/v1/News', methods=['DELETE'])
def delNews_api():
    try:
        id_int = int(request.args.get('id_int'))
    except Exception as e:
        return jsonify(e), 400

    try:
        suc = delNews(id_int)
    except Exception as e:
        return  jsonify(e), 500

    if suc is not True:
        return jsonify(suc), 500
    else:
        return jsonify(True), 200
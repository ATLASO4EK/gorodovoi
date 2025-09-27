import datetime
from src.API.app import app
from flask import  request, jsonify

from src.Database.news.delete_news import delNews
from src.Database.news.get_news import getFullNews, getLastNews, getLastNews_tg
from src.Database.news.post_news import  postNews
from src.Database.news.put_news import putNews

# Получить
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

# Добавить
@app.route('/api/v1/News',methods=['POST'])
def postNews_api():
    try:
        date = datetime.datetime.now()
        author = request.args.get('author')
        header = request.args.get('header')
        short_text = request.args.get('short_text')
        full_text = request.args.get('full_text')
        image = request.files.get('image')
    except Exception as e:
        return jsonify(e), 400

    try:
        postNews(
            date = date,
            author = author,
            header = header,
            short_text = short_text,
            full_text = full_text,
            image = image
        )
        return jsonify(True), 200

    except Exception as e:
        return jsonify(e), 400

# Удалить
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

# Обновить
@app.route('/api/v1/News', methods=['PUT'])
def putNews_api():
    try:
        id_int = int(request.args.get('id_int'))
        date = datetime.datetime.now()
        author = str(request.args.get('author'))
        header = str(request.args.get('header'))
        short_text = str(request.args.get('short_text'))
        full_text = str(request.args.get('full_text'))
        image = str(request.args.get('image'))
    except Exception as e:
        return jsonify(e), 400

    if id_int is None or date is None or author is None or header is None or short_text is None or full_text is None or image is None:
        return jsonify('Bad Request: not enough args'), 400

    try:
        suc = putNews(id_int, date, author, header,
                      short_text, full_text, image)
    except Exception as e:
        return jsonify(e), 500

    if suc is not True:
        return jsonify('Internal Server Error: SQL-query has not been commited'), 500
    else:
        return jsonify(True), 200
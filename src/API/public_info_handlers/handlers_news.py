from src.API.app import app
from flask import  request, jsonify
import datetime

from src.Database.news.DB_news import putNews
from src.Database.news.DB_news import postNews
from src.Database.news.DB_news import getLastNews
from src.Database.news.DB_news import delNews

@app.route('/api/v1/News', methods=['GET'])
def getNews_api():
    try:
        filters = request.args.get('filters')
    except Exception as e:
        print(e)
        return jsonify(['Incorrect type of args',e]), 400

    try:
        return jsonify(getLastNews(filters=filters)), 200
    except Exception as e:
        print(e)
        return jsonify(e), 500

@app.route('/api/v1/News',methods=['POST'])
def postNews_api():
    try:
        date = datetime.datetime.now()
        author = request.args.get('author')
        header = request.args.get('header')
        short_text = request.args.get('short_text')
        full_text = request.args.get('full_text')
        image = request.args.get('image')
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
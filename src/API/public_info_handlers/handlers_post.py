from src.API.app import app
from flask import  request, jsonify
import datetime

from src.Database.news.post_news import  postNews

@app.route('/api/v1/News',methods=['POST'])
def postNews():
    try:
        date = datetime.datetime.now()
        author = request.args.get('author')
        header = request.args.get('header')
        short_text = request.args.get('short_text')
        full_text = request.args.get('full_text')
        img = request.files.get('img')
    except Exception as e:
        return jsonify(e), 400

    try:
        postNews(
            date = date,
            author = author,
            header = header,
            short_text = short_text,
            full_text = full_text,
            img = img
        )
        return jsonify(True), 200

    except Exception as e:
        return jsonify(e), 400
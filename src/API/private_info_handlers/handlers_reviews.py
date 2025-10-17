from datetime import datetime
from flask import request, jsonify
from src.API.app import app


from src.Database.reviews.DB_reviews import post_reviews

@app.route('/api/v1/reviews', methods=['POST'])
def post_review_api():
    try:
        date = datetime.now()
        text = str(request.args.get('text'))
    except Exception as e:
        return jsonify(e), 400

    try:
        suc = post_reviews(date=date, text=text)

        return jsonify(suc), 200
    except Exception as e:
        return jsonify(e), 500


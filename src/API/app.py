from flask import Flask
from flask_cors import CORS
# Инициализируем объект API
app = Flask(__name__)
CORS(app)
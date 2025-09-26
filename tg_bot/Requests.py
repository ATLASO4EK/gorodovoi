import requests
import json

url= 'http://127.0.0.1:5000/api/v1/News'
params = {}

params['filters']= 'tg'
responce = requests.get(url, params=params)
respons = json.loads(responce.content.decode('utf-8'))

print(respons)


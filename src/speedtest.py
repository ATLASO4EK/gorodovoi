import datetime
import json

import requests

speedtests = {}

url = 'http://127.0.0.1:8000/api/v1/tracks_traffic/coop_analytics'

start = datetime.datetime.now()
resp = requests.get(url, params={'identificator': 'Б541ЫЫ', 'min_nodes': 3})
end = datetime.datetime.now()
speedtests.update({'coop_analytics':(end-start).total_seconds()})


url = 'http://127.0.0.1:8000/api/v1/tracks_traffic/clustering?start_ts=2025-10-15T10:00:00&end_ts=2025-10-15T10:05:45&top_n=10&eps=0.0005&similarity_threshold=0.65'

start = datetime.datetime.now()
resp = requests.get(url)
end = datetime.datetime.now()
speedtests.update({'clustering':(end-start).total_seconds()})

url = 'http://127.0.0.1:8000/api/v1/tracks_traffic/clustering-pair?start_a=2025-10-15T10:00:00&end_a=2025-10-15T10:05:45&start_b=2025-10-16T10:00:00&end_b=2025-10-16T10:05:45'

start = datetime.datetime.now()
resp = requests.get(url)
end = datetime.datetime.now()
speedtests.update({'clustering-pair':(end-start).total_seconds()})

with open('speedtests.json', 'w') as fp:
    json.dump(speedtests, fp)
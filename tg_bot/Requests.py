import requests
import json
from states import MyStates

urlForNews= 'http://127.0.0.1:8000/api/v1/News'
urlForReg = 'http://127.0.0.1:8000/api/v1/tg'
params = {}
Reg={}

params['filters']= 'tg'
Reg['tg_id']='tg'

responce = requests.get(urlForNews, params=params)
respons = json.loads(responce.content.decode('utf-8'))

PostFunc= requests.post(urlForReg,)

Reg= requests.get(urlForReg)
regs = json.loads(Reg.content.decode('utf-8'))
print(regs)
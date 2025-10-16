db_conn = 'dbname=smolathon user=admin password=FMlJH4 host=103.31.78.42 port=5432'
PG_URL= "postgresql+psycopg2://admin:FMlJH4@103.31.78.42:5432/smolathon?sslmode=prefer"
bot = '8360276940:AAEAd1U-AX0oiJ_YCJZJQVRBhZkrMBnMU_A'

admin = 'czdd_EDKaSHyt20gbz__Ww5Iqna2-NMZ2_Nd6aaw3Mq33Hzc'
editor = 'czdd_zMbAEW4dhaqX2cdHEmIzLfcqlpVsRuyVI_Fd9GjyKfg'

api_url = 'http://45.144.177.53:8000/api/v1/'

def get_api() -> str:
    return api_url

def getConnData() -> str:
    return db_conn

def getBotToken() -> str:
    return bot

def getAdm() -> str:
    return admin

def getEditor() -> str:
    return editor
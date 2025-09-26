db_conn = 'dbname=smolathon user=admin password=FMlJH4 host=103.31.78.42 port=5432'
PG_URL= "postgresql+psycopg2://admin:FMlJH4@103.31.78.42:5432/smolathon?sslmode=prefer"
bot = '8248257481:AAEt4tVIsAA-s_sLKCWu9bOuQoC7oy7CMjY'
def getConnData() -> str:
    return db_conn

def getBotToken():
    return bot
import psycopg2
from sqlalchemy import create_engine
from config import getConnData

def connect():
    conn = psycopg2.connect(getConnData())  # DSN вида: "host=... dbname=... user=... ..."
    cursor = conn.cursor()
    return conn, cursor


from config import PG_URL  # строка URL

def get_engine():
    return create_engine(PG_URL, future=True)

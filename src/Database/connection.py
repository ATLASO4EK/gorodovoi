import psycopg2
from src.config import getConnData

def connect():
    conn = psycopg2.connect(getConnData())
    cursor = conn.cursor()
    return conn, cursor
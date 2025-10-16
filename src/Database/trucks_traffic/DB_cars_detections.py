from src.Database.connection import connect
import datetime

def get_detections(identificator:str=None,
                   detector:str=None):
    try:
        conn, cur = connect()
    except Exception as e:
        return False, e

    if identificator is not None and detector is not None:
        query = f"SELECT * FROM tracks_traffic.geolabels WHERE identificator='{identificator}' AND detector='{detector}'"
    elif identificator is not None:
        query = f"SELECT * FROM tracks_traffic.geolabels WHERE identificator='{identificator}'"
    elif detector is not None:
        query = f"SELECT * FROM tracks_traffic.geolabels WHERE detector='{detector}'"
    else:
        query = 'SELECT * FROM tracks_traffic.geolabels'

    try:
        cur.execute(query)
        data = cur.fetchall()

        cur.close()
        conn.close()

        return True, data
    except Exception as e:
        return False, e

def post_detection(detector:str,
                   labeltime:datetime.datetime,
                   identificator:str,
                   speedtime:float):
    try:
        conn, cur = connect()
    except Exception as e:
        return False, e

    data = (detector, labeltime, identificator, speedtime)
    query = 'INSERT INTO tracks_traffic.geolabels (detector, labeltime, identificator, speedtime) VALUES (%s, %s, %s, %s);'

    try:
        cur.execute(query, data)
        conn.commit()

        cur.close()
        conn.close()

        return True, None
    except Exception as e:
        return False, e
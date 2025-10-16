from src.Database.connection import connect
import datetime

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
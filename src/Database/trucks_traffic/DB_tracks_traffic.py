from src.Database.connection import connect

def get_detectors(name:str=None):
    try:
        conn, cur = connect()
    except Exception as e:
        return False, e

    if name is not None:
        query = f"SELECT * FROM tracks_traffic.coords WHERE name='{name}'"
    elif name is None:
        query = 'SELECT * FROM tracks_traffic.coords'
    else:
        return False, 'Bad Request: Incorrect or missing args'

    try:
        cur.execute(query)
        data = cur.fetchall()

        cur.close()
        conn.close()

        return True, data
    except Exception as e:
        return False, e

def post_detector(name:str,
                  lat:float,
                  lon:float):
    try:
        conn, cur = connect()
    except Exception as e:
        return False, e

    data = (name, lat, lon)
    query = 'INSERT INTO tracks_traffic.coords (name, lat, lon) VALUES (%s, %s, %s);'

    try:
        cur.execute(query, data)
        conn.commit()

        cur.close()
        conn.close()

        return True, None
    except Exception as e:
        return False, e
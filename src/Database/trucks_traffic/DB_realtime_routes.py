from src.Database.connection import connect

def get_routes(
        identificator:str=None
):
    try:
        conn, cur = connect()
    except Exception as e:
        return False, e

    if identificator is not None:
        query = f"SELECT * FROM tracks_traffic.coords WHERE identificator='{identificator}'"
    elif identificator is None:
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

def post_route(
        identificator:str,
        route:list
):
    try:
        conn, cur = connect()
    except Exception as e:
        return False, e

    data = (identificator, route)
    query = 'INSERT INTO tracks_traffic.realtime_routes (identificator, route) VALUES (%s, %s);'

    try:
        cur.execute(query, data)
        conn.commit()

        cur.close()
        conn.close()

        return True, None
    except Exception as e:
        return False, e

def put_route(
        identificator:str,
        route:list
):
    try:
        conn, cur = connect()
    except Exception as e:
        return False, e

    query = ("UPDATE tracks_traffic.realtime_routes "
             "SET "
             "route = %s "
             "WHERE "
             "identificator = %s;")
    data = (route, identificator)

    try:
        cur.execute(query, data)
        conn.commit()

        cur.close()
        conn.close()

        return True, None
    except Exception as e:
        return False, e

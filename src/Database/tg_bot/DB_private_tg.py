from src.Database.connection import connect

def get_users():
    try:
        conn, cur = connect()
    except Exception as e:
        return False, e

    query = f'SELECT * FROM private_tg.users'

    try:
        cur.execute(query)
        data = cur.fetchall()

        cur.close()
        conn.close()

        return True, data
    except Exception as e:
        return False, e

def post_users(tg_id:int):
    try:
        conn, cur = connect()
    except Exception as e:
        return False, e

    data = (tg_id, )
    query = f'INSERT INTO private_tg.users (tg_id) VALUES (%s);'

    try:
        cur.execute(query, data)
        conn.commit()

        cur.close()
        conn.close()

        return True, None
    except Exception as e:
        return False, e
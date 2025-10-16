from src.Database.connection import connect

def getPrivateTg(id_int:int=None,
          tg_id:int=None):
    conn, cur = connect()

    if id_int is not None:
        query = f"SELECT * FROM private_tg.users WHERE id = {id_int}"
    elif tg_id is not None:
        query = f"SELECT * FROM private_tg.users WHERE tg_id = {tg_id}"
    else:
        query = f"SELECT * FROM private_tg.users"

    cur.execute(query)
    ans = cur.fetchall()

    cur.close()
    conn.close()

    return ans

def postPrivateTg(tg_id:int):
    conn, cur = connect()

    query = f"INSERT INTO private_tg.users (tg_id) VALUES (%s);"
    data = (tg_id)

    cur.execute(query, data)
    conn.commit()

    cur.close()
    conn.close()

    return True
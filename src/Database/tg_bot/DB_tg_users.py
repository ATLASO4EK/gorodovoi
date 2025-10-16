from src.Database.connection import connect

def getTg(id_int:int=None,
          tg_id:int=None,
          isnotifon:bool=None):
    conn, cur = connect()

    if id_int is not None:
        query = f"SELECT * FROM private.tgusers WHERE id = {id_int}"
    elif tg_id is not None:
        query = f"SELECT * FROM private.tgusers WHERE tg_id = {tg_id}"
    elif isnotifon is not None:
        query = f"SELECT * FROM private.tgusers WHERE isnotifon = {isnotifon}"
    else:
        query = "SELECT * FROM private.tgusers"

    cur.execute(query)
    ans = cur.fetchall()

    cur.close()
    conn.close()

    return ans

def postTg(tg_id:int,
          isnotifon:bool,
          chat_id:int):
    conn, cur = connect()

    query = 'INSERT INTO private.tgusers (tg_id, isnotifon, chat_id) VALUES (%s, %s, %s);'
    data = (tg_id, isnotifon, chat_id)

    cur.execute(query, data)
    conn.commit()

    cur.close()
    conn.close()

    return True



def putTg(tg_id: int = None,
          isnotifon: bool = None):
    conn, cur = connect()

    query = ("UPDATE private.tgusers "
             "SET "
             "isnotifon = %s "
             "WHERE "
             "tg_id = %s;")
    data = (isnotifon, tg_id)

    cur.execute(query, data)
    conn.commit()

    cur.close()
    conn.close()

    return True
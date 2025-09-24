from src.Database.connection import *

def delNews(header:str):
    """
    Удаляет новость из БД по заголовку
    :param header:
    :return: True если успешно
    """

    conn, cur = connect()

    query = f"DELETE FROM public.news WHERE header = '{header}';"

    try:
        cur.execute(query)
        conn.commit()
    except Exception as e:
        print(e)
        cur.close()
        conn.close()
        return False, e

    cur.close()
    conn.close()

    return True, None

from src.Database.connection import *

def delNews(id_int:int):
    """
    Удаляет новость из БД по заголовку
    :param header:
    :return: True если успешно
    """

    conn, cur = connect()

    if id_int is not None:
        query = f"DELETE FROM public.news WHERE id = '{id_int}';"
    else:
        return 'Not enough argss'


    try:
        cur.execute(query)
        conn.commit()
    except Exception as e:
        print(e)
        cur.close()
        conn.close()
        return e

    cur.close()
    conn.close()

    return True

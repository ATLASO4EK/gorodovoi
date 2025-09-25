from src.Database.connection import *

def delNews(id_int:int=None,
            header:str=None):
    """
    Удаляет новость из БД по заголовку
    :param header:
    :return: True если успешно
    """

    conn, cur = connect()

    if id_int is not None and header is not None:
        query = f"DELETE FROM public.news WHERE id = '{id_int}' AND header = {header};"
    elif id_int is not None:
        query = f"DELETE FROM public.news WHERE id = '{id_int}';"
    elif id_int is None and header is not None:
        query = f"DELETE FROM public.news WHERE header = '{header}';"
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

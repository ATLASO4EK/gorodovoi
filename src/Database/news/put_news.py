import datetime

from src.Database.connection import *

def putNews(id_int:int,
            date:datetime.datetime,
            author:str,
            header:str,
            short_text:str,
            full_text:str,
            image:str):
    """
    Изменяет строку в БД с новостями
    :return:
    """

    conn, cur = connect()

    data = (date, author, header, short_text, full_text, image, id_int)
    query = ("UPDATE public.news "
             "SET "
             "datetime = %s, "
             "author = %s, "
             "header = %s, "
             "short_text = %s, "
             "full_text = %s, "
             "image = %s "
             "WHERE "
             "id = %s")

    try:
        cur.execute(query, data)
        conn.commit()
        return True

    except Exception as e:
        print(e)
        return e
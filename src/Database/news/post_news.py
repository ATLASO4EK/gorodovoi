import datetime
from src.Database.connection import *

def postNews(date:datetime.datetime,
             author:str,
             header:str,
             short_text:str,
             full_text:str,
             image:str):
    """
    Добавляет в БД строку с новостью
    :param date:
    :param author:
    :param header:
    :param short_text:
    :param full_text:
    :param image:
    :return: True если удачно
    """
    conn, cur = connect()

    data = (date.strftime('%Y-%m-%d'), author, header, short_text, full_text, image)
    query = (
        "INSERT INTO public.news (datetime, author, header, short_text, full_text, image) VALUES (%s, %s, %s, %s, %s, %s);")

    try:
        cur.execute(query, data)
        conn.commit()
    except Exception as e:
        cur.close()
        conn.close()
        print(e)
        return False, e

    cur.close()
    conn.close()

    return True, None
import datetime
from src.Database.connection import *

def getLastNews(filters:str=None):
    """
    Возвращает из SQL-таблицы данные о 4 последних новостях
    :return:
    """
    conn, cur = connect()

    if filters == 'tg':
        query = 'SELECT * FROM public.news ORDER BY id DESC LIMIT 2'
    elif filters == 'last':
        query = 'SELECT * FROM public.news ORDER BY id DESC LIMIT 4'
    else:
        query = 'SELECT * FROM public.news'

    try:
        cur.execute(query)
        news = cur.fetchall()
    except Exception as e:
        print(e)
        return e

    cur.close()
    conn.close()

    return news

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

        cur.close()
        conn.close()
        return True

    except Exception as e:
        print(e)
        return e

def delNews(id_int:int):
    """
    Удаляет новость из БД
    :return: True если успешно
    """

    conn, cur = connect()

    if id_int is not None:
        query = f"DELETE FROM public.news WHERE id = '{id_int}';"
    else:
        return 'Not enough args'


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

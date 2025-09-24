from src.Database.connection import *

def getLastNews():
    """
    Возвращает из SQL-таблицы данные о 4 последних новостях
    :return:
    """
    conn, cur = connect()

    query = 'SELECT * FROM public.news ORDER BY datetime DESC LIMIT 4'

    try:
        cur.execute(query)
        news = cur.fetchall()
    except Exception as e:
        print(e)
        return False, e

    return True, news

def getLastNews_tg():
    """
    Возвращает из SQL-таблицы данные о 2 последних новостях без развернутого текста
    :return:
    """
    conn, cur = connect()

    query = 'SELECT author, header, short_text FROM public.news ORDER BY datetime DESC LIMIT 2'

    try:
        cur.execute(query)
        news = cur.fetchall()
    except Exception as e:
        print(e)
        return False, e

    return True, news

def getFullNews():
    """
    Возвращает из SQL-таблицы данные о всех новостях
    :return:
    """
    conn, cur = connect()

    query = 'SELECT * FROM public.news'

    try:
        cur.execute(query)
        news = cur.fetchall()
    except Exception as e:
        print(e)
        return False, e

    return True, news

print('a')
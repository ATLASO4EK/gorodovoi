import logging
import datetime
from connection import *

def getEvacuationStats(date:datetime.date,
                       date_end=None,
                       lower_num:int=None,
                       max_num:int=None):
    """
    Возвращает отфильтрованные (опционально) данные из таблицы БД о штрафах
    :param date:
    :param date_end:
    :param lower_num:
    :param max_num:
    :return:
    """
    # В РАЗРАБОТКЕ
    conn, cur = connect()

    query = f"SELECT * FROM city_ops.evacuation_daily WHERE event_date = '{date.isoformat()}'"

    if date_end is not None:
        query = (f"SELECT * FROM city_ops.evacuation_daily WHERE event_date >= '{date.isoformat()}' "
                 f"AND event_date <= '{date_end}'")

    cur.execute(query)
    data = cur.fetchall()

    return data

def getMVDStats():
    """
    Возвращает отфильтрованные (опционально) данные из таблицы БД о штрафах
    :return:
    """
    # В РАЗРАБОТКЕ
    conn, cur = connect()

    query = f"SELECT * FROM city_ops.mvd"

    cur.execute(query)
    data = cur.fetchall()

    return data

def getFinesStats(date:datetime.date=None,
                  date_end:datetime.date=None,
                  cam_lownum:int=None,
                  cam_maxnum:int=None,
                  dec_lownum:int=None,
                  dec_maxnum:int=None,
                  fines_lownum:float=None,
                  fines_maxnum:float=None,
                  got_minnum:float=None,
                  got_maxnum:float=None) -> list:
    """
    Возвращает отфильтрованные (опционально) данные из таблицы БД о штрафах
    :param date:
    :param date_end:
    :param cam_lownum:
    :param cam_maxnum:
    :param dec_lownum:
    :param dec_maxnum:
    :param fines_lownum:
    :param fines_maxnum:
    :param got_minnum:
    :param got_maxnum:
    :return: list со строками таблицы БД
    """
    conn, cur = connect()

    # Составление запроса
    # Если мы получили на входе функции и дату (начальную) и дату окончания, то выборка идет по периоду
    if date is not None and date_end is not None:
        query = (f"SELECT * FROM city_ops.fines WHERE report_date >= '{date.isoformat()}' "
                 f"AND report_date <= '{date_end.isoformat()}'")
    # Если получили только дату, то выборка идет по конкретной дате
    elif date is not None:
        query = f"SELECT * FROM city_ops.fines WHERE report_date = '{date.isoformat()}' "
    # Если не получили дату (начальную), то выборка идет по всей таблице
    else:
        query = "SELECT * FROM city_ops.fines WHERE id > -100"

    # Фильтры
    # Если на входе функции есть данные о фильтрах,
    # по типу минимально полученная сумма за день = 1000,
    # то выборка фильтруется и в ней остаются только строки, где полученная сумма >= 1000

    # Принцип работы -> если на входе функции есть данные о фильтрах, добавляем соответсвующую строку
    if cam_lownum is not None:
        query += f"AND cams_violations_cum >= {cam_lownum} "

    if cam_maxnum is not None:
        query += f"AND cams_violations_cum <= {cam_maxnum} "

    if dec_lownum is not None:
        query += f"AND decisions_cum >= {dec_lownum} "

    if dec_maxnum is not None:
        query += f"AND decisions_cum <= {dec_lownum} "

    if fines_lownum is not None:
        query += f"AND fines_sum_cum >= {fines_lownum} "

    if fines_maxnum is not None:
        query += f"AND fines_sum_cum <= {fines_maxnum} "

    if got_minnum is not None:
        query += f"AND collected_sum_cum >= {got_minnum} "

    if got_maxnum is not None:
        query += f"AND collected_sum_cum <= {got_maxnum} "

    cur.execute(query)
    data = cur.fetchall()

    return data

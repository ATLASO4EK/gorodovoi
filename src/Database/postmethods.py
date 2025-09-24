import datetime
from src.Database.connection import *

def postEvacuate(date:datetime.date,
                trucks_num:int,
                trips_num:int,
                evac_num:int,
                rev_rub:float):
    """
    Запрос к SQL-таблице city_ops.evacuation_daily на добавление новой строки
    :param date: день
    :param trucks_num: машин было на линии в этот день
    :param trips_num: количество вызовов
    :param evac_num: количество эвакуаций
    :param rev_rub: прибыль штраф-стоянки
    :return: True если успешно
    """
    conn, cur = connect()

    data = (date.strftime('%Y-%m-%d'), trucks_num, trips_num, evac_num, rev_rub)
    query = ("INSERT INTO city_ops.evacuation_daily (event_date, tow_trucks_on_line, trips_count, evacuations_count, impound_revenue_rub) VALUES (%s, %s, %s, %s, %s);")

    cur.execute(query, data)
    conn.commit()

    cur.close()
    conn.close()

    return True, None

def postMVD():
    pass

def postFines():
    pass
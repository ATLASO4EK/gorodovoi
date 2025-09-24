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

    query = (f"INSERT INTO city_ops.evacuation_daily "
             f"VALUES ('{date.strftime('%Y-%m-%d')}', '{trucks_num}', '{trips_num}', '{evac_num}', '{rev_rub}')")

    try:
        cur.execute(query)
    except Exception as e:
        print(e)
        return False, e

    cur.close()
    conn.close()

    return True

def postMVD():
    pass

def postFines():
    pass
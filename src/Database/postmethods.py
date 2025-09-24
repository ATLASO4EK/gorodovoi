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

def postMVD(date_start:datetime.date,
            date_end:datetime.date,
            period_text:str,
            crashes:int,
            deaths:int,
            injuries:int,
            death_stat:float):

    conn, cur = connect()

    data = (date_start.strftime('%Y-%m-%d'), date_end.strftime('%Y-%m-%d'), period_text, crashes, deaths, injuries, death_stat)
    query = "INSERT INTO city_ops.mvd (event_date, tow_trucks_on_line, trips_count, evacuations_count, impound_revenue_rub) VALUES (%s, %s, %s, %s, %s, %s, %s);"

    cur.execute(query, data)
    conn.commit()

    cur.close()
    conn.close()

    return True, None

def postFines(date:datetime.date,
              cam_vial:int,
              decisions:int,
              fines_sum:float,
              collected_sum:float):
    conn, cur = connect()

    data = (date.strftime('%Y-%m-%d'), cam_vial, decisions, fines_sum, collected_sum)
    query = "INSERT INTO city_ops.evacuation_daily (event_date, tow_trucks_on_line, trips_count, evacuations_count, impound_revenue_rub) VALUES (%s, %s, %s, %s, %s);"

    cur.execute(query, data)
    conn.commit()

    cur.close()
    conn.close()

    return True, None
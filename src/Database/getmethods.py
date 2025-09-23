import logging
import datetime
from connection import *

def getEvacuationStats(date:datetime.date,
                       date_end=None,
                       lower_num:int=None,
                       max_num:int=None):
        conn, cur = connect()

        query = f"SELECT * FROM city_ops.evacuation_daily WHERE event_date = '{date.isoformat()}'"

        if date_end is not None:
            query = (f"SELECT * FROM city_ops.evacuation_daily WHERE event_date >= '{date.isoformat()}' "
                     f"AND event_date <= '{date_end}'")

        cur.execute(query)
        data = cur.fetchall()

        return data

def getMVDStats():
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
                  got_maxnum:float=None):
    conn, cur = connect()

    # Составление запроса + фильтры
    if date is not None and date_end is not None:
        query = (f"SELECT * FROM city_ops.fines WHERE report_date >= '{date.isoformat()}' "
                 f"AND report_date <= '{date_end}'")
    elif date is not None:
        query = f"SELECT * FROM city_ops.fines WHERE report_date = '{date.isoformat()}' "
    else:
        query = "SELECT * FROM city_ops.fines WHERE collected_sum_cum > -100"

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

print('a')
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

    if date is None:
        query = "SELECT * FROM city_ops.fines"
        cur.execute(query)
        data = cur.fetchall()

        return data

    query = f"SELECT * FROM city_ops.fines WHERE report_date = '{date.isoformat()}'"

    if date_end is not None:
        query = (f"SELECT * FROM city_ops.fines WHERE report_date >= '{date.isoformat()}' "
                 f"AND report_date <= '{date_end}'")






    cur.execute(query)
    data = cur.fetchall()

    return data

print('a')
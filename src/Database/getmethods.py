import logging
import datetime
from connection import *

def getEvacuationStats(date, date_end=None):
        conn, cur = connect()

        query = f"SELECT * FROM city_ops.evacuation_daily WHERE event_date = '{date}'"

        if date_end is not None:
            query = (f"SELECT * FROM city_ops.evacuation_daily WHERE event_date >= '{date}' "
                     f"AND event_date <= '{date_end}'")

        cur.execute(query)
        data = cur.fetchall()

        return data


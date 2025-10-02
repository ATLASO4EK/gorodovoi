import datetime
from typing import Optional, Tuple
from src.Database.connection import *

def deleteEvacuateByDate(event_date: datetime.date) -> Tuple[bool, Optional[str]]:
    """
    Удаляет строку по event_date.
    """
    conn, cur = connect()
    try:
        cur.execute(
            "DELETE FROM city_ops.evacuation_daily WHERE event_date = %s",
            (event_date.strftime('%Y-%m-%d'),)
        )
        if cur.rowcount == 0:
            return False, "Строка не найдена"
        conn.commit()
        return True, None
    except Exception as e:
        conn.rollback()
        return False, str(e)
    finally:
        cur.close()
        conn.close()


def deleteFines(row_id: int) -> Tuple[bool, Optional[str]]:
    conn, cur = connect()
    try:
        cur.execute("DELETE FROM city_ops.fines WHERE id = %s", (row_id,))
        if cur.rowcount == 0:
            return False, "Строка не найдена"
        conn.commit()
        return True, None
    except Exception as e:
        conn.rollback()
        return False, str(e)
    finally:
        cur.close()
        conn.close()


def deleteMVD(row_id: int) -> Tuple[bool, Optional[str]]:
    conn, cur = connect()
    try:
        cur.execute("DELETE FROM city_ops.mvd WHERE id = %s", (row_id,))
        if cur.rowcount == 0:
            return False, "Строка не найдена"
        conn.commit()
        return True, None
    except Exception as e:
        conn.rollback()
        return False, str(e)
    finally:
        cur.close()
        conn.close()

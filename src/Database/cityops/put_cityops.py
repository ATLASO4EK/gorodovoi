import datetime
from typing import Optional, Tuple
from src.Database.connection import *

def putEvacuateByDate(
    event_date: datetime.date,
    tow_trucks_on_line: Optional[int] = None,
    trips_count: Optional[int] = None,
    evacuations_count: Optional[int] = None,
    impound_revenue_rub: Optional[float] = None,
    upsert: bool = False
) -> Tuple[bool, Optional[str]]:
    """
    Частичное обновление строки по event_date.
    Если upsert=True и строки нет — создаст запись (нужно передать все обязательные поля).
    """
    # простая предвалидация, чтобы не ловить CHECK-ошибки из БД
    if trips_count is not None and evacuations_count is not None:
        if evacuations_count > trips_count:
            return False, "evacuations_count не может быть больше trips_count"

    conn, cur = connect()
    try:
        updates, params = [], []
        if tow_trucks_on_line is not None:
            updates.append("tow_trucks_on_line = %s"); params.append(tow_trucks_on_line)
        if trips_count is not None:
            updates.append("trips_count = %s"); params.append(trips_count)
        if evacuations_count is not None:
            updates.append("evacuations_count = %s"); params.append(evacuations_count)
        if impound_revenue_rub is not None:
            updates.append("impound_revenue_rub = %s"); params.append(impound_revenue_rub)

        if not updates and not upsert:
            return False, "Нет полей для обновления"

        # пробуем UPDATE
        if updates:
            params_update = params + [event_date.strftime('%Y-%m-%d')]
            query = f"""
                UPDATE city_ops.evacuation_daily
                SET {", ".join(updates)}
                WHERE event_date = %s
            """
            cur.execute(query, params_update)
            if cur.rowcount > 0:
                conn.commit()
                return True, None

        # если ничего не обновили и разрешён upsert — вставляем
        if upsert:
            # для вставки обязательны все 4 числовых поля
            if (tow_trucks_on_line is None or trips_count is None or
                evacuations_count is None or impound_revenue_rub is None):
                return False, "Для upsert требуется передать все поля: tow_trucks_on_line, trips_count, evacuations_count, impound_revenue_rub"

            insert_sql = """
                INSERT INTO city_ops.evacuation_daily
                (event_date, tow_trucks_on_line, trips_count, evacuations_count, impound_revenue_rub)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (event_date) DO UPDATE SET
                  tow_trucks_on_line = EXCLUDED.tow_trucks_on_line,
                  trips_count = EXCLUDED.trips_count,
                  evacuations_count = EXCLUDED.evacuations_count,
                  impound_revenue_rub = EXCLUDED.impound_revenue_rub
            """
            cur.execute(insert_sql, (
                event_date.strftime('%Y-%m-%d'),
                tow_trucks_on_line, trips_count, evacuations_count, impound_revenue_rub
            ))
            conn.commit()
            return True, None

        return False, "Строка с такой датой не найдена"

    except Exception as e:
        conn.rollback()
        return False, str(e)
    finally:
        cur.close()
        conn.close()

def putFines(
    row_id: int,
    report_date: Optional[datetime.date] = None,
    cams_violations_cum: Optional[int] = None,
    decisions_cum: Optional[int] = None,
    fines_sum_cum: Optional[float] = None,
    collected_sum_cum: Optional[float] = None
) -> Tuple[bool, Optional[str]]:
    updates, params = [], []
    if report_date is not None:
        updates.append("report_date = %s"); params.append(report_date.strftime('%Y-%m-%d'))
    if cams_violations_cum is not None:
        updates.append("cams_violations_cum = %s"); params.append(cams_violations_cum)
    if decisions_cum is not None:
        updates.append("decisions_cum = %s"); params.append(decisions_cum)
    if fines_sum_cum is not None:
        updates.append("fines_sum_cum = %s"); params.append(fines_sum_cum)
    if collected_sum_cum is not None:
        updates.append("collected_sum_cum = %s"); params.append(collected_sum_cum)

    if not updates:
        return False, "Нет полей для обновления"

    params.append(row_id)
    query = f"UPDATE city_ops.fines SET {', '.join(updates)} WHERE id = %s"

    conn, cur = connect()
    try:
        cur.execute(query, params)
        if cur.rowcount == 0:
            return False, "Строка не найдена"
        conn.commit()
        return True, None
    except Exception as e:
        conn.rollback()
        return False, str(e)
    finally:
        cur.close(); conn.close()

def putMVD(
    row_id: int,
    period_label: Optional[str] = None,
    region: Optional[str] = None,
    period_start: Optional[datetime.date] = None,
    period_end: Optional[datetime.date] = None,
    crashes_with_victims: Optional[int] = None,
    deaths: Optional[int] = None,
    injuries: Optional[int] = None,
    deaths_per_100_victims: Optional[float] = None
) -> Tuple[bool, Optional[str]]:
    updates, params = [], []
    if period_label is not None:
        updates.append("period_label = %s"); params.append(period_label)
    if region is not None:
        updates.append("region = %s"); params.append(region)
    if period_start is not None:
        updates.append("period_start = %s"); params.append(period_start.strftime('%Y-%m-%d'))
    if period_end is not None:
        updates.append("period_end = %s"); params.append(period_end.strftime('%Y-%m-%d'))
    if crashes_with_victims is not None:
        updates.append("crashes_with_victims = %s"); params.append(crashes_with_victims)
    if deaths is not None:
        updates.append("deaths = %s"); params.append(deaths)
    if injuries is not None:
        updates.append("injuries = %s"); params.append(injuries)
    if deaths_per_100_victims is not None:
        updates.append("deaths_per_100_victims = %s"); params.append(deaths_per_100_victims)

    if not updates:
        return False, "Нет полей для обновления"

    params.append(row_id)
    query = f"UPDATE city_ops.mvd SET {', '.join(updates)} WHERE id = %s"

    conn, cur = connect()
    try:
        cur.execute(query, params)
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


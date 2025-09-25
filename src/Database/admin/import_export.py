# src/Database/admin/import_export.py
import re
import pandas as pd
from sqlalchemy import text
from src.Database.connection import get_engine

ENGINE = get_engine()
SCHEMA = "city_ops"

# ========================
# Словари для маппинга
# ========================

MONTH_MAP_RU = {
    "январь": 1, "февраль": 2, "март": 3, "апрель": 4, "май": 5, "июнь": 6,
    "июль": 7, "август": 8, "сентябрь": 9, "октябрь": 10, "ноябрь": 11, "декабрь": 12
}

RU2SQL_FINES = {
    "дата": "report_date",
    "количество зафиксированных нарушений камерами фвф (нарастающим итогом)": "cams_violations_cum",
    "количество вынесенных постановлений (нарастающим итогом)": "decisions_cum",
    "сумма наложенных штрафов (нарастающим итогом)": "fines_sum_cum",
    "сумма взысканных штрафов (нарастающим итогом)": "collected_sum_cum",
}
SQL2RU_FINES = {
    "report_date": "Дата",
    "cams_violations_cum": "Количество зафиксированных нарушений камерами ФВФ (нарастающим итогом)",
    "decisions_cum": "Количество вынесенных постановлений (нарастающим итогом)",
    "fines_sum_cum": "Сумма наложенных штрафов (нарастающим итогом)",
    "collected_sum_cum": "Сумма взысканных штрафов (нарастающим итогом)",
}
EXPECTED_FINES = list(SQL2RU_FINES.keys())

RU2SQL_EVAC = {
    "дата": "event_date",
    "количество эвакуаторов на линии": "tow_trucks_on_line",
    "количество выездов": "trips_count",
    "количество эвакуаций": "evacuations_count",
    "сумма поступлений по  штрафстоянке": "impound_revenue_rub",
}
SQL2RU_EVAC = {
    "event_date": "Дата",
    "tow_trucks_on_line": "Количество эвакуаторов на линии",
    "trips_count": "Количество выездов",
    "evacuations_count": "Количество эвакуаций",
    "impound_revenue_rub": "Сумма поступлений по  штрафстоянке",
}
EXPECTED_EVAC = list(SQL2RU_EVAC.keys())

RU2SQL_ROUTES = {"год": "year", "месяц": "month_name_ru", "маршрут": "route"}
SQL2RU_ROUTES = {"year": "год", "month_name_ru": "месяц", "route": "маршрут"}
EXPECTED_ROUTES = list(SQL2RU_ROUTES.keys())

RU2SQL_LIGHTS = {
    "№ п/п": "registry_no",
    "адрес": "address",
    "тип светофора": "signal_type",
    "год установки": "installation_year",
}
SQL2RU_LIGHTS = {
    "registry_no": "№ П/П",
    "address": "адрес",
    "signal_type": "тип светофора",
    "installation_year": "год установки",
}
EXPECTED_LIGHTS = list(SQL2RU_LIGHTS.keys())

SHEET_ALIASES = {
    "fines": {"fines", "штрафы", "shtrafy", "fine"},
    "evac": {"evac", "эвакуация", "evacuation", "evac_daily"},
    "routes": {"routes", "маршруты", "эвакуация маршрут", "marshruty", "evac_routes"},
    "lights": {"lights", "светофоры", "реестр светофоров", "traffic_lights"},
}

def _norm_key(s: str) -> str:
    return str(s).strip().lower()

def _resolve_sheet_keys(sheets: list[str] | None) -> set[str]:
    if not sheets:
        return {"fines", "evac", "routes", "lights"}
    wanted = set()
    for raw in sheets:
        v = _norm_key(raw)
        for key, aliases in SHEET_ALIASES.items():
            if v == key or v in { _norm_key(a) for a in aliases }:
                wanted.add(key)
                break
    return wanted or {"fines", "evac", "routes", "lights"}  # если ничего не распознали — всё

# ========================
# Утилиты
# ========================

def _ncol(s: str) -> str:
    """Нормализация названий колонок"""
    s = str(s).replace("\ufeff", "").replace("\xa0", " ").strip().lower()
    s = re.sub(r"\s+", " ", s).replace("ё", "е")
    trans = str.maketrans({"a": "а", "e": "е", "o": "о", "c": "с", "p": "р", "x": "х", "k": "к", "y": "у", "m": "м"})
    return s.translate(trans)

def _read_guess_header(xlsx_path, sheet, headers=(0, 1, 2, 3, 4)):
    """Пробуем разные строки как заголовки."""
    last = None
    for h in headers:
        try:
            df = pd.read_excel(xlsx_path, sheet_name=sheet, header=h, dtype=object)
            return df, h
        except Exception as e:
            last = e
    if last:
        raise last

def _rename_generic(df: pd.DataFrame, ru2sql: dict, expected_sql_cols: list) -> pd.DataFrame:
    """Переименование: русские → SQL + допускаем уже-SQL названия."""
    norm_map = {_ncol(c): c for c in df.columns}
    ren = {}

    for ru, sql in ru2sql.items():
        n = _ncol(ru)
        if n in norm_map:
            ren[norm_map[n]] = sql
    for sql in expected_sql_cols:
        n = _ncol(sql)
        if n in norm_map:
            ren[norm_map[n]] = sql

    return df.rename(columns=ren)

def _sync_identity_sequence(conn, table: str):
    """Подгоняем последовательность id к MAX(id), чтобы авто-ID не конфликтовали после ручных вставок."""
    conn.execute(text(f"""
        SELECT CASE
                 WHEN pg_get_serial_sequence('{SCHEMA}.{table}','id') IS NOT NULL THEN
                   setval(pg_get_serial_sequence('{SCHEMA}.{table}','id'),
                          COALESCE((SELECT MAX(id) FROM {SCHEMA}.{table}), 0))
               END;
    """))

# ========================
# Импорт
# ========================

def import_from_xlsx(xlsx_path: str) -> dict:
    xf = pd.ExcelFile(xlsx_path)
    raw_names = list(xf.sheet_names)

    # Определяем листы по имени (толерантно)
    fines_sheets, evac_sheets = [], []
    routes_sheet, lights_sheet = None, None
    for name in raw_names:
        n = _ncol(name)
        if n.startswith("штраф"):
            fines_sheets.append(name); continue
        if n.startswith("эвак") and "маршрут" not in n:
            evac_sheets.append(name); continue
        if ("эвак" in n and "маршрут" in n) or ("маршрут" in n and "эвак" in n):
            if routes_sheet is None: routes_sheet = name
            continue
        if ("реестр" in n and "светоф" in n) or ("светоф" in n):
            if lights_sheet is None: lights_sheet = name
            continue

    summary = {"fines": 0, "evacuation_daily": 0, "evacuation_routes": 0, "traffic_lights": 0, "skipped_sheets": []}

    # -------- ШТРАФЫ --------
    if fines_sheets:
        parts = []
        for sh in fines_sheets:
            df_raw, _ = _read_guess_header(xlsx_path, sh)
            df = _rename_generic(df_raw, RU2SQL_FINES, EXPECTED_FINES)
            need = EXPECTED_FINES.copy()
            cols = (["id"] if "id" in df.columns else []) + need
            if not all(c in df.columns for c in need):
                continue
            df = df[cols].copy()

            df["report_date"] = pd.to_datetime(
                df["report_date"].astype(str).str.strip(), errors="coerce", dayfirst=True
            ).fillna(pd.to_datetime(df["report_date"], errors="coerce")).dt.date

            for c in ["cams_violations_cum","decisions_cum","fines_sum_cum","collected_sum_cum"]:
                df[c] = (
                    df[c].astype(str)
                        .str.replace("\xa0","", regex=False)
                        .str.replace(" ","", regex=False)
                        .str.replace(",", ".", regex=False)
                )
                df[c] = pd.to_numeric(df[c], errors="coerce")

            if "id" in df.columns:
                df["id"] = pd.to_numeric(df["id"], errors="coerce").astype("Int64")

            df = df.dropna(subset=["report_date"])
            parts.append(df)

        if parts:
            fines = pd.concat(parts, ignore_index=True)

            # гарантируем, что во временной таблице есть id (nullable)
            if "id" not in fines.columns:
                fines["id"] = pd.NA
            fines = fines[["id","report_date","cams_violations_cum","decisions_cum","fines_sum_cum","collected_sum_cum"]]

            fines.to_sql("fines_tmp", con=ENGINE, schema=SCHEMA, if_exists="replace", index=False, method="multi")

            with ENGINE.begin() as conn_:
                # с id
                conn_.execute(text(f"""
                    INSERT INTO {SCHEMA}.fines
                        (id, report_date, cams_violations_cum, decisions_cum, fines_sum_cum, collected_sum_cum)
                    SELECT t.id, t.report_date,
                           COALESCE(t.cams_violations_cum,0),
                           COALESCE(t.decisions_cum,0),
                           COALESCE(t.fines_sum_cum,0),
                           COALESCE(t.collected_sum_cum,0)
                    FROM {SCHEMA}.fines_tmp t
                    WHERE t.id IS NOT NULL
                    ON CONFLICT (id) DO UPDATE SET
                        report_date         = EXCLUDED.report_date,
                        cams_violations_cum = EXCLUDED.cams_violitions_cum,
                        decisions_cum       = EXCLUDED.decisions_cum,
                        fines_sum_cum       = EXCLUDED.fines_sum_cum,
                        collected_sum_cum   = EXCLUDED.collected_sum_cum;
                """.replace("cams_violitions_cum", "cams_violations_cum")))  # опечатка страхуем replace'ом

                # без id (даём БД сгенерировать) — конфликт по report_date
                conn_.execute(text(f"""
                    INSERT INTO {SCHEMA}.fines
                        (report_date, cams_violations_cum, decisions_cum, fines_sum_cum, collected_sum_cum)
                    SELECT t.report_date,
                           COALESCE(t.cams_violations_cum,0),
                           COALESCE(t.decisions_cum,0),
                           COALESCE(t.fines_sum_cum,0),
                           COALESCE(t.collected_sum_cum,0)
                    FROM {SCHEMA}.fines_tmp t
                    WHERE t.id IS NULL
                    ON CONFLICT (report_date) DO UPDATE SET
                        cams_violations_cum = EXCLUDED.cams_violations_cum,
                        decisions_cum       = EXCLUDED.decisions_cum,
                        fines_sum_cum       = EXCLUDED.fines_sum_cum,
                        collected_sum_cum   = EXCLUDED.collected_sum_cum;
                """))

                _sync_identity_sequence(conn_, "fines")
                conn_.execute(text(f"DROP TABLE {SCHEMA}.fines_tmp;"))

            summary["fines"] = int(len(fines))
        else:
            summary["skipped_sheets"].append("Штрафы")
    else:
        summary["skipped_sheets"].append("Штрафы")

    # -------- ЭВАКУАЦИЯ (daily) --------
    if evac_sheets:
        parts = []
        for sh in evac_sheets:
            df_raw, _ = _read_guess_header(xlsx_path, sh)
            df = _rename_generic(df_raw, RU2SQL_EVAC, EXPECTED_EVAC)
            need = EXPECTED_EVAC.copy()
            cols = (["id"] if "id" in df.columns else []) + need
            if not all(c in df.columns for c in need):
                continue
            df = df[cols].copy()

            df["event_date"] = pd.to_datetime(
                df["event_date"].astype(str).str.strip(), errors="coerce", dayfirst=True
            ).fillna(pd.to_datetime(df["event_date"], errors="coerce")).dt.date

            for c in ["tow_trucks_on_line","trips_count","evacuations_count","impound_revenue_rub"]:
                df[c] = (
                    df[c].astype(str)
                        .str.replace("\xa0","", regex=False)
                        .str.replace(" ","", regex=False)
                        .str.replace(",", ".", regex=False)
                )
                df[c] = pd.to_numeric(df[c], errors="coerce")

            if "id" in df.columns:
                df["id"] = pd.to_numeric(df["id"], errors="coerce").astype("Int64")

            df = df.dropna(subset=["event_date"])
            parts.append(df)

        if parts:
            evac = pd.concat(parts, ignore_index=True)
            if "id" not in evac.columns:
                evac["id"] = pd.NA
            evac = evac[["id","event_date","tow_trucks_on_line","trips_count","evacuations_count","impound_revenue_rub"]]

            evac.to_sql("evac_tmp", con=ENGINE, schema=SCHEMA, if_exists="replace", index=False, method="multi")

            with ENGINE.begin() as conn_:
                conn_.execute(text(f"""
                    INSERT INTO {SCHEMA}.evacuation_daily
                        (id, event_date, tow_trucks_on_line, trips_count, evacuations_count, impound_revenue_rub)
                    SELECT t.id, t.event_date,
                           COALESCE(t.tow_trucks_on_line,0),
                           COALESCE(t.trips_count,0),
                           COALESCE(t.evacuations_count,0),
                           COALESCE(t.impound_revenue_rub,0)
                    FROM {SCHEMA}.evac_tmp t
                    WHERE t.id IS NOT NULL
                    ON CONFLICT (id) DO UPDATE SET
                        event_date          = EXCLUDED.event_date,
                        tow_trucks_on_line  = EXCLUDED.tow_trucks_on_line,
                        trips_count         = EXCLUDED.trips_count,
                        evacuations_count   = EXCLUDED.evacuations_count,
                        impound_revenue_rub = EXCLUDED.impound_revenue_rub;
                """))
                conn_.execute(text(f"""
                    INSERT INTO {SCHEMA}.evacuation_daily
                        (event_date, tow_trucks_on_line, trips_count, evacuations_count, impound_revenue_rub)
                    SELECT t.event_date,
                           COALESCE(t.tow_trucks_on_line,0),
                           COALESCE(t.trips_count,0),
                           COALESCE(t.evacuations_count,0),
                           COALESCE(t.impound_revenue_rub,0)
                    FROM {SCHEMA}.evac_tmp t
                    WHERE t.id IS NULL
                    ON CONFLICT (event_date) DO UPDATE SET
                        tow_trucks_on_line  = EXCLUDED.tow_trucks_on_line,
                        trips_count         = EXCLUDED.trips_count,
                        evacuations_count   = EXCLUDED.evacuations_count,
                        impound_revenue_rub = EXCLUDED.impound_revenue_rub;
                """))

                _sync_identity_sequence(conn_, "evacuation_daily")
                conn_.execute(text(f"DROP TABLE {SCHEMA}.evac_tmp;"))

            summary["evacuation_daily"] = int(len(evac))
        else:
            summary["skipped_sheets"].append("Эвакуация")
    else:
        summary["skipped_sheets"].append("Эвакуация")

    # -------- ЭВАКУАЦИЯ МАРШРУТ --------
    if routes_sheet:
        routes_raw, _ = _read_guess_header(xlsx_path, routes_sheet, headers=(4, 1, 0, 2, 3))
        routes = _rename_generic(routes_raw, RU2SQL_ROUTES, EXPECTED_ROUTES)
        cols = (["id"] if "id" in routes.columns else []) + EXPECTED_ROUTES
        routes = routes[[c for c in cols if c in routes.columns]].copy()

        if not routes.empty:
            if "id" in routes.columns:
                routes["id"] = pd.to_numeric(routes["id"], errors="coerce").astype("Int64")
            routes["year"] = pd.to_numeric(routes.get("year"), errors="coerce")
            routes["month_name_ru"] = routes.get("month_name_ru").astype(str).str.strip().str.lower().str.replace("ё","е")
            routes["month_num"] = routes["month_name_ru"].map(MONTH_MAP_RU)
            routes = routes.dropna(subset=["year","month_num","route"])

        if not routes.empty:
            if "id" not in routes.columns:
                routes["id"] = pd.NA
            routes = routes[["id","year","month_num","month_name_ru","route"]]

            routes.to_sql("routes_tmp", con=ENGINE, schema=SCHEMA, if_exists="replace", index=False, method="multi")

            with ENGINE.begin() as conn_:
                conn_.execute(text(f"""
                    INSERT INTO {SCHEMA}.evacuation_routes
                        (id, year, month_num, month_name_ru, route)
                    SELECT t.id, t.year, t.month_num, t.month_name_ru, t.route
                    FROM {SCHEMA}.routes_tmp t
                    WHERE t.id IS NOT NULL
                    ON CONFLICT (id) DO UPDATE SET
                        year = EXCLUDED.year,
                        month_num = EXCLUDED.month_num,
                        month_name_ru = EXCLUDED.month_name_ru,
                        route = EXCLUDED.route;
                """))
                conn_.execute(text(f"""
                    INSERT INTO {SCHEMA}.evacuation_routes
                        (year, month_num, month_name_ru, route)
                    SELECT t.year, t.month_num, t.month_name_ru, t.route
                    FROM {SCHEMA}.routes_tmp t
                    WHERE t.id IS NULL
                    ON CONFLICT (year, month_num) DO UPDATE SET
                        month_name_ru = EXCLUDED.month_name_ru,
                        route = EXCLUDED.route;
                """))

                _sync_identity_sequence(conn_, "evacuation_routes")
                conn_.execute(text(f"DROP TABLE {SCHEMA}.routes_tmp;"))

            summary["evacuation_routes"] = int(len(routes))
        else:
            summary["skipped_sheets"].append("Эвакуация маршрут")
    else:
        summary["skipped_sheets"].append("Эвакуация маршрут")

    # -------- РЕЕСТР СВЕТОФОРОВ --------
    if lights_sheet:
        lights_raw, _ = _read_guess_header(xlsx_path, lights_sheet)
        lights = _rename_generic(lights_raw, RU2SQL_LIGHTS, EXPECTED_LIGHTS)
        cols = (["id"] if "id" in lights.columns else []) + EXPECTED_LIGHTS
        lights = lights[[c for c in cols if c in lights.columns]].copy()

        if not lights.empty:
            if "id" in lights.columns:
                lights["id"] = pd.to_numeric(lights["id"], errors="coerce").astype("Int64")
            for c in ["registry_no","installation_year"]:
                if c in lights.columns:
                    lights[c] = pd.to_numeric(lights[c], errors="coerce")
            lights = lights.dropna(subset=["address","signal_type","installation_year"])

        if not lights.empty:
            if "id" not in lights.columns:
                lights["id"] = pd.NA
            lights = lights[["id","registry_no","address","signal_type","installation_year"]]

            lights.to_sql("lights_tmp", con=ENGINE, schema=SCHEMA, if_exists="replace", index=False, method="multi")

            with ENGINE.begin() as conn_:
                conn_.execute(text(f"""
                    INSERT INTO {SCHEMA}.traffic_lights
                        (id, registry_no, address, signal_type, installation_year)
                    SELECT t.id, t.registry_no, t.address, t.signal_type, t.installation_year
                    FROM {SCHEMA}.lights_tmp t
                    WHERE t.id IS NOT NULL
                    ON CONFLICT (id) DO UPDATE SET
                        registry_no = EXCLUDED.registry_no,
                        address = EXCLUDED.address,
                        signal_type = EXCLUDED.signal_type,
                        installation_year = EXCLUDED.installation_year;
                """))
                conn_.execute(text(f"""
                    INSERT INTO {SCHEMA}.traffic_lights
                        (registry_no, address, signal_type, installation_year)
                    SELECT t.registry_no, t.address, t.signal_type, t.installation_year
                    FROM {SCHEMA}.lights_tmp t
                    WHERE t.id IS NULL
                    ON CONFLICT (address, signal_type) DO UPDATE SET
                        registry_no = EXCLUDED.registry_no,
                        installation_year = EXCLUDED.installation_year;
                """))

                _sync_identity_sequence(conn_, "traffic_lights")
                conn_.execute(text(f"DROP TABLE {SCHEMA}.lights_tmp;"))

            summary["traffic_lights"] = int(len(lights))
        else:
            summary["skipped_sheets"].append("Реестр светофоров")
    else:
        summary["skipped_sheets"].append("Реестр светофоров")

    return summary

# ========================
# Экспорт
# ========================


def export_to_xlsx(xlsx_path: str, sheets: list[str] | None = None):
    wanted = _resolve_sheet_keys(sheets)
    dataframes = {}

    # Используем sqlalchemy-Connection (без .connection), чтобы убрать варнинги
    with ENGINE.begin() as conn:
        if "fines" in wanted:
            fines = pd.read_sql(
                sql=f"SELECT report_date,cams_violations_cum,decisions_cum,fines_sum_cum,collected_sum_cum "
                    f"FROM {SCHEMA}.fines ORDER BY report_date",
                con=conn
            )
            fines = fines.rename(columns=SQL2RU_FINES)
            if "Дата" in fines.columns:
                fines["Дата"] = pd.to_datetime(fines["Дата"]).dt.strftime("%d.%m.%Y")
            dataframes["Штрафы"] = fines

        if "evac" in wanted:
            evac = pd.read_sql(
                sql=f"SELECT event_date,tow_trucks_on_line,trips_count,evacuations_count,impound_revenue_rub "
                    f"FROM {SCHEMA}.evacuation_daily ORDER BY event_date",
                con=conn
            )
            evac = evac.rename(columns=SQL2RU_EVAC)
            if "Дата" in evac.columns:
                evac["Дата"] = pd.to_datetime(evac["Дата"]).dt.strftime("%d.%m.%Y")
            dataframes["Эвакуация"] = evac

        if "routes" in wanted:
            routes = pd.read_sql(
                sql=f"SELECT year,month_name_ru,route FROM {SCHEMA}.evacuation_routes ORDER BY year,month_num",
                con=conn
            )
            routes = routes.rename(columns=SQL2RU_ROUTES)
            dataframes["Эвакуация маршрут"] = routes

        if "lights" in wanted:
            lights = pd.read_sql(
                sql=f"SELECT registry_no,address,signal_type,installation_year "
                    f"FROM {SCHEMA}.traffic_lights ORDER BY installation_year,address",
                con=conn
            )
            lights = lights.rename(columns=SQL2RU_LIGHTS)
            dataframes["Реестр светофоров"] = lights

    # Если ничего не распознали/не выбрали — создаём README-лист
    if not dataframes:
        with pd.ExcelWriter(xlsx_path, engine="openpyxl") as w:
            pd.DataFrame({"info": ["Не распознаны ключи листов. Допустимые: fines, evac, routes, lights"]})\
              .to_excel(w, sheet_name="README", index=False)
        return {"path": xlsx_path, "exported": []}

    with pd.ExcelWriter(xlsx_path, engine="openpyxl") as w:
        for sheet_name, df in dataframes.items():
            df.to_excel(w, sheet_name=sheet_name, index=False)

    return {"path": xlsx_path, "exported": list(dataframes.keys())}

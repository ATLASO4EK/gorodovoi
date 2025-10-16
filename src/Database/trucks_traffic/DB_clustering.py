from __future__ import annotations
from collections import Counter
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Sequence, Tuple, Optional, Any

import math
import pandas as pd
import src.API.tracklib as tl
from src.Database.connection import connect

SCHEMA  = "tracks_traffic"
T_GEO   = "geolabels"
T_COORD = "coords"

Point = Tuple[float, float]

@dataclass
class Track:
    ident: str
    detectors: List[str]
    points: List[Point]
    start_ts: datetime
    end_ts: datetime
    avg_speed: Optional[float]

@dataclass
class Cluster:
    rep_idx: int
    members: List[int]


def _fetch_df(cur, query: str, params: Optional[dict | tuple] = None) -> pd.DataFrame:
    cur.execute(query, params or ())
    rows = cur.fetchall()
    cols = [d[0] for d in cur.description]
    return pd.DataFrame(rows, columns=cols)


def get_top_routes(
    start_ts: datetime,
    end_ts: datetime,
    top_n: int = 10,
    eps: float = 0.0005,
    similarity_threshold: float = 0.65,
) -> List[dict]:
    """
    Возвращает топ маршрутов (кластеров) за указанный интервал.
    """
    conn, cur = connect()
    try:
        # --- координаты ---
        sql_coords = f'SELECT name, latitude, longitude FROM "{SCHEMA}"."{T_COORD}";'
        df_coords = _fetch_df(cur, sql_coords)

        coord_map: Dict[str, Point] = {}
        for _, r in df_coords.iterrows():
            name = str(r["name"]).strip().lower() if pd.notna(r["name"]) else ""
            lat = float(r["latitude"]) if pd.notna(r["latitude"]) else None
            lon = float(r["longitude"]) if pd.notna(r["longitude"]) else None
            if name and lat is not None and lon is not None and -90 <= lat <= 90 and -180 <= lon <= 180:
                coord_map[name] = (lon, lat)

        # --- события ---
        sql_events = f"""
            SELECT identificator, detector, labeltime, speedtime, id
            FROM "{SCHEMA}"."{T_GEO}"
            WHERE labeltime >= %(start_ts)s AND labeltime < %(end_ts)s
              AND identificator IS NOT NULL AND detector IS NOT NULL
            ORDER BY identificator, labeltime, id;
        """
        df = _fetch_df(cur, sql_events, {"start_ts": start_ts, "end_ts": end_ts})

        if df.empty:
            return []

        # --- треки ---
        tracks: List[Track] = []
        for ident, grp in df.groupby("identificator", sort=False):
            dets = [str(d).strip().lower() for d in grp["detector"].tolist()]
            times = pd.to_datetime(grp["labeltime"]).tolist()
            speeds = pd.to_numeric(grp["speedtime"], errors="coerce").tolist()

            # убираем подряд идущие повторы
            dedup_dets, dedup_times, dedup_speeds = [], [], []
            prev = None
            for d, t, s in zip(dets, times, speeds):
                if d and d != prev:
                    dedup_dets.append(d); dedup_times.append(t); dedup_speeds.append(s)
                    prev = d

            pts, used_dets, used_times, used_speeds = [], [], [], []
            for d, t, s in zip(dedup_dets, dedup_times, dedup_speeds):
                if d in coord_map:
                    pts.append(coord_map[d]); used_dets.append(d); used_times.append(t); used_speeds.append(s)

            if len(used_dets) < 2:
                continue

            avg_speed = None
            spd = [v for v in used_speeds if v is not None and not math.isnan(v)]
            if spd:
                avg_speed = sum(spd) / len(spd)

            tracks.append(Track(
                ident=str(ident),
                detectors=used_dets,
                points=pts,
                start_ts=used_times[0],
                end_ts=used_times[-1],
                avg_speed=avg_speed
            ))

        # --- кластеризация ---
        if not tracks:
            return []

        def sim(i: int, j: int) -> float:
            return float(tl.Matches_All(tracks[i].points, tracks[j].points, eps))

        clusters: List[Cluster] = []
        for i in range(len(tracks)):
            best_c = -1
            best_s = -1.0
            for c_idx, c in enumerate(clusters):
                s = sim(i, c.rep_idx)
                if s > best_s:
                    best_s = s; best_c = c_idx
            if best_s >= similarity_threshold and best_c >= 0:
                clusters[best_c].members.append(i)
                rep = clusters[best_c].rep_idx
                if tl.length(tracks[i].points) > tl.length(tracks[rep].points):
                    clusters[best_c].rep_idx = i
            else:
                clusters.append(Cluster(rep_idx=i, members=[i]))

        # --- агрегирование ---
        def canonical_route(det_lists: Sequence[List[str]]) -> str:
            paths = [",".join(d) for d in det_lists if d]
            return Counter(paths).most_common(1)[0][0] if paths else ""

        hours = max(1e-9, (end_ts - start_ts).total_seconds() / 3600.0)
        results = []
        for c in clusters:
            members = [tracks[i] for i in c.members]
            if not members: continue
            vehicles = len(members)
            intensity = vehicles / hours
            speeds = [m.avg_speed for m in members if m.avg_speed is not None]
            avg_speed = sum(speeds)/len(speeds) if speeds else None
            times = [(m.end_ts - m.start_ts).total_seconds() for m in members]
            avg_time = sum(times)/len(times) if times else None
            route_str = canonical_route([m.detectors for m in members])
            results.append({
                "route": route_str,
                "vehicles_count": vehicles,
                "intensity_per_hour": intensity,
                "avg_speed": avg_speed,
                "avg_travel_time_sec": avg_time,
            })

        results.sort(key=lambda r: r["vehicles_count"], reverse=True)
        return results[:top_n]

    finally:
        try: cur.close()
        except: pass
        try: conn.close()
        except: pass


def get_top_routes_pair(
    start_a: datetime, end_a: datetime,
    start_b: datetime, end_b: datetime,
    top_n: int = 10,
    eps: float = 0.0005,
    similarity_threshold: float = 0.65,
) -> Dict[str, Any]:
    """
    Запускает get_top_routes для двух интервалов и возвращает обе выборки.
    """
    top_a = get_top_routes(start_a, end_a, top_n=top_n, eps=eps, similarity_threshold=similarity_threshold)
    top_b = get_top_routes(start_b, end_b, top_n=top_n, eps=eps, similarity_threshold=similarity_threshold)
    return {
        "A": {"start": start_a.isoformat(), "end": end_a.isoformat(), "top": top_a},
        "B": {"start": start_b.isoformat(), "end": end_b.isoformat(), "top": top_b},
    }
from __future__ import annotations
from dataclasses import dataclass
from math import hypot, sqrt
from typing import Iterable, List, Sequence, Tuple

Point = Tuple[float, float]

def _sqr(v: float) -> float:
    return v * v

def scalar_product(p1: Point, p2: Point) -> float:
    """Скалярное произведение для векторов, заданных как точки от (0,0)."""
    return p1[0] * p2[0] + p1[1] * p2[1]

def _sub(a: Point, b: Point) -> Point:
    return (a[0] - b[0], a[1] - b[1])

def TTP(p1: Point, p2: Point, p: Point) -> float:
    """
    Кратчайшее расстояние от точки p до отрезка p1–p2.
    Алгоритм с проекцией и отсечкой по [0,1].
    """
    vx, vy = p2[0] - p1[0], p2[1] - p1[1]
    seg_len2 = vx * vx + vy * vy
    if seg_len2 == 0.0:
        return hypot(p[0] - p1[0], p[1] - p1[1])

    wx, wy = p[0] - p1[0], p[1] - p1[1]
    t = (wx * vx + wy * vy) / seg_len2
    if t <= 0.0:
        return hypot(p[0] - p1[0], p[1] - p1[1])
    if t >= 1.0:
        return hypot(p[0] - p2[0], p[1] - p2[1])

    px, py = p1[0] + t * vx, p1[1] + t * vy
    return hypot(p[0] - px, p[1] - py)

def same_direct(p1: Point, p2: Point, d1: Point, d2: Point) -> bool:
    """
    True, если направления (p1→p2) и (d1→d2) образуют угол ≤ 45°.
    """
    ax, ay = p2[0] - p1[0], p2[1] - p1[1]
    bx, by = d2[0] - d1[0], d2[1] - d1[1]
    la = hypot(ax, ay)
    lb = hypot(bx, by)
    if la == 0.0 or lb == 0.0:
        return False
    cosang = (ax * bx + ay * by) / (la * lb)
    return cosang >= sqrt(2.0) / 2.0  # cos 45°

def length(track: Sequence[Point]) -> float:
    """Суммарная длина ломаной."""
    n = len(track)
    if n <= 1:
        return 0.0
    res = 0.0
    for i in range(n - 1):
        res += hypot(track[i + 1][0] - track[i][0], track[i + 1][1] - track[i][1])
    return res

def matches(t1: Sequence[Point], t2: Sequence[Point], eps: float) -> float:
    """
    Доля пути t1, проходящая на расстоянии < eps от отрезков t2
    и с согласованным направлением.
    """
    if len(t1) <= 1 or len(t2) <= 1 or eps < 0.0:
        return 0.0

    n1 = len(t1)
    incl = [False] * n1

    # первая точка
    for j in range(len(t2) - 1):
        if TTP(t2[j], t2[j + 1], t1[0]) < eps:
            incl[0] = True
            break

    coincident_len = 0.0
    total_len = 0.0

    for i in range(1, n1):
        seg_len = hypot(t1[i][0] - t1[i - 1][0], t1[i][1] - t1[i - 1][1])
        total_len += seg_len

        any_near = False
        directed_near = False

        for j in range(len(t2) - 1):
            near = TTP(t2[j], t2[j + 1], t1[i]) < eps
            any_near = any_near or near
            if near and same_direct(t2[j], t2[j + 1], t1[i - 1], t1[i]):
                directed_near = True
                break

        if directed_near and incl[i - 1]:
            coincident_len += seg_len

        incl[i] = any_near

    if total_len == 0.0:
        return 0.0
    return coincident_len / total_len

def Matches_All(t1: Sequence[Point], t2: Sequence[Point], eps: float) -> float:
    """
    Симметричная мера совпадения:
    (matches(t1,t2)*|t1| + matches(t2,t1)*|t2|) / (|t1|+|t2|)
    """
    s1 = length(t1)
    s2 = length(t2)
    if s1 + s2 == 0.0:
        return 0.0
    m12 = matches(t1, t2, eps)
    m21 = matches(t2, t1, eps)
    return (m12 * s1 + m21 * s2) / (s1 + s2)

# ---------- CLI ----------
def _read_tracks_semicolon_csv(path: str) -> List[List[Point]]:
    """
    Ожидается таблица с колонками:
    0: id трека (целое, начиная с 1)
    2: x (float)
    3: y (float)
    Строка заголовка в первой строке допускается.
    """
    import csv
    with open(path, newline="") as f:
        r = list(csv.reader(f, delimiter=";", quotechar=";"))
    # найдём max id, считаем что первая строка — заголовок
    max_id = int(r[-1][0])
    tracks: List[List[Point]] = []
    for i in range(1, max_id + 1):
        pts = [(float(row[2]), float(row[3])) for row in r[1:] if row and row[0].isdigit() and int(row[0]) == i]
        tracks.append(pts)
    return tracks

def main(argv: Sequence[str] | None = None) -> None:
    """
    Использование:
      python -m tracklib_py traks.csv 1 3 0.5
    где 1 и 3 — номера треков (1-based), 0.5 — eps (по умолчанию 1.0).
    """
    import sys
    args = list(sys.argv[1:] if argv is None else argv)
    if len(args) in (0, 1) or args[0] in ("-h", "--help"):
        print(main.__doc__)
        return
    csv_path = args[0]
    first = int(args[1]) - 1 if len(args) > 1 else 0
    second = int(args[2]) - 1 if len(args) > 2 else 1
    eps = float(args[3]) if len(args) > 3 else 1.0

    tracks = _read_tracks_semicolon_csv(csv_path)
    if not (0 <= first < len(tracks) and 0 <= second < len(tracks)):
        raise IndexError("Неверные индексы треков.")
    print(Matches_All(tracks[first], tracks[second], eps))

if __name__ == "__main__":
    main()

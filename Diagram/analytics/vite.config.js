import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

/**
 * Как запустить:
 *  1) npm create vite@latest codd-charts -- --template react
 *  2) cd codd-charts && npm i recharts
 *  3) замените src/App.jsx на этот файл
 *  4а) (рекомендуется) Vite proxy без CORS:
 *      vite.config.js ->
 *      import { defineConfig } from 'vite'
 *      import react from '@vitejs/plugin-react'
 *      export default defineConfig({
 *        plugins: [react()],
 *        server: { proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } } },
 *      })
 *      И оставьте API_BASE пустым (ниже).
 *  4б) Или прямой доступ к Flask (+CORS на бэке): создайте .env с VITE_API_BASE=http://localhost:8000
 *  5) npm run dev
 */

const API_BASE = import.meta.env.VITE_API_BASE || ""; // если используете прокси Vite — оставьте пустым

// ---------- утилиты дат/чисел ----------
function asDate(s) {
  try {
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s);
    const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s);
    if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`);
    const d = new Date(s);
    return isNaN(d) ? null : d;
  } catch {
    return null;
  }
}
function fmtISO(d) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}
function asNumber(x) {
  if (x === null || x === undefined) return 0;
  if (typeof x === "number") return x;
  const s = String(x).replace(/\u00A0/g, "").replace(/\s+/g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

const numFmt = new Intl.NumberFormat("ru-RU");
const moneyFmt = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});
const numCompact = new Intl.NumberFormat("ru-RU", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const rubCompact = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  notation: "compact",
  maximumFractionDigits: 1,
});
function fmt(kind, v) {
  const n = Number(v) || 0;
  if (kind === "rub") return rubCompact.format(n);
  if (kind === "pct") return `${n.toFixed(1)}%`;
  return numCompact.format(n);
}

// ---------- обёртка fetch с подсказкой, если пришёл HTML ----------
async function fetchJson(url) {
  const res = await fetch(url);
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
  }
  if (!ct.includes("application/json")) {
    throw new Error(`Expected JSON, got ${ct || "unknown"}: ${text.slice(0, 200)}`);
  }
  return JSON.parse(text);
}

// ---------- RAW API ----------
async function fetchFines(dateStart, dateEnd) {
  const p = new URLSearchParams();
  if (dateStart) p.set("date", fmtISO(dateStart));
  if (dateEnd) p.set("date_end", fmtISO(dateEnd));
  const url = `${API_BASE}/api/v1/FinesStats${p.toString() ? `?${p.toString()}` : ""}`;
  const raw = await fetchJson(url);
  // ожидаем SELECT *: [id, report_date, cams_violations_cum, decisions_cum, fines_sum_cum, collected_sum_cum]
  return raw
    .map((row) => {
      const hasId = row.length >= 6;
      const id = hasId ? row[0] : undefined;
      const date = hasId ? row[1] : row[0];
      const cams = hasId ? row[2] : row[1];
      const decisions = hasId ? row[3] : row[2];
      const finesSum = hasId ? row[4] : row[3];
      const collected = hasId ? row[5] : row[4];
      return {
        id,
        date: asDate(date),
        cams: asNumber(cams),
        decisions: asNumber(decisions),
        finesSum: asNumber(finesSum),
        collected: asNumber(collected),
      };
    })
    .filter((r) => r.date);
}

async function fetchEvac(dateStart, dateEnd) {
  const p = new URLSearchParams();
  if (dateStart) p.set("date", fmtISO(dateStart));
  if (dateEnd) p.set("date_end", fmtISO(dateEnd));
  const url = `${API_BASE}/api/v1/EvacuationStats${p.toString() ? `?${p.toString()}` : ""}`;
  const raw = await fetchJson(url);
  // ожидаем SELECT *: [id, event_date, tow_trucks_on_line, trips_count, evacuations_count, impound_revenue_rub]
  return raw
    .map((row) => {
      const hasId = row.length >= 6;
      const id = hasId ? row[0] : undefined;
      const date = hasId ? row[1] : row[0];
      const tow = hasId ? row[2] : row[1];
      const trips = hasId ? row[3] : row[2];
      const evac = hasId ? row[4] : row[3];
      const revenue = hasId ? row[5] : row[4];
      return {
        id,
        date: asDate(date),
        tow: asNumber(tow),
        trips: asNumber(trips),
        evac: asNumber(evac),
        revenue: asNumber(revenue),
      };
    })
    .filter((r) => r.date);
}

// ---------- агрегаторы ----------
function aggregateFines(rows) {
  const byDay = rows
    .slice()
    .sort((a, b) => a.date - b.date)
    .map((r) => ({
      date: fmtISO(r.date),
      Нарушения: r.cams,
      Постановления: r.decisions,
      Штрафы: r.finesSum,
      Взыскано: r.collected,
    }));

  const sums = rows.reduce(
    (acc, r) => {
      acc.cams += r.cams;
      acc.decisions += r.decisions;
      acc.fines += r.finesSum;
      acc.collected += r.collected;
      return acc;
    },
    { cams: 0, decisions: 0, fines: 0, collected: 0 }
  );

  const outstanding = Math.max(0, sums.fines - sums.collected);

  return {
    byDay,
    kpis: [
      { k: "Нарушения (камера)", v: sums.cams, kind: "num" },
      { k: "Постановления", v: sums.decisions, kind: "num" },
      { k: "Сумма штрафов", v: sums.fines, kind: "rub" },
      { k: "Взыскано", v: sums.collected, kind: "rub" },
      { k: "Доля взысканий", v: sums.fines ? (sums.collected / sums.fines) * 100 : 0, kind: "pct" },
      { k: "Средний штраф/постановление", v: sums.decisions ? sums.fines / sums.decisions : 0, kind: "rub" },
    ],
    pie: [
      { name: "Взыскано", value: sums.collected, kind: "rub" },
      { name: "Осталось", value: outstanding, kind: "rub" },
    ],
    bar: [
      { name: "Нарушения", value: sums.cams, kind: "num" },
      { name: "Постановления", value: sums.decisions, kind: "num" },
      { name: "Штрафы", value: sums.fines, kind: "rub" },
      { name: "Взыскано", value: sums.collected, kind: "rub" },
    ],
  };
}

function aggregateEvac(rows) {
  const byDay = rows
    .slice()
    .sort((a, b) => a.date - b.date)
    .map((r) => ({
      date: fmtISO(r.date),
      Выезды: r.trips,
      Эвакуации: r.evac,
      Поступления: r.revenue,
    }));

  const sums = rows.reduce(
    (acc, r) => {
      acc.trips += r.trips;
      acc.evac += r.evac;
      acc.revenue += r.revenue;
      return acc;
    },
    { trips: 0, evac: 0, revenue: 0 }
  );

  const rest = Math.max(0, sums.trips - sums.evac);

  return {
    byDay,
    kpis: [
      { k: "Выезды", v: sums.trips, kind: "num" },
      { k: "Эвакуации", v: sums.evac, kind: "num" },
      { k: "Поступления", v: sums.revenue, kind: "rub" },
      { k: "Доля эвакуаций", v: sums.trips ? (sums.evac / sums.trips) * 100 : 0, kind: "pct" },
      { k: "Средние поступления/эвакуацию", v: sums.evac ? sums.revenue / sums.evac : 0, kind: "rub" },
    ],
    pie: [
      { name: "Эвакуации", value: sums.evac, kind: "num" },
      { name: "Прочие выезды", value: rest, kind: "num" },
    ],
    bar: [
      { name: "Выезды", value: sums.trips, kind: "num" },
      { name: "Эвакуации", value: sums.evac, kind: "num" },
      { name: "Поступления", value: sums.revenue, kind: "rub" },
    ],
  };
}

// ---------- UI ----------
export default function App() {
  const [tab, setTab] = useState("fines"); // fines | evac
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const ds = dateStart ? asDate(dateStart) : null;
      const de = dateEnd ? asDate(dateEnd) : null;
      const data = tab === "fines" ? await fetchFines(ds, de) : await fetchEvac(ds, de);
      setRows(data);
    } catch (e) {
      setError(e.message || String(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const agg = useMemo(() => (tab === "fines" ? aggregateFines(rows) : aggregateEvac(rows)), [tab, rows]);

  return (
    <div style={{ padding: 20, maxWidth: 1280, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif", color: "#111827" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>ЦОДД — диаграммы с сырых API</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#374151", marginBottom: 6 }}>Таблица</label>
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #d1d5db", minWidth: 180 }}
          >
            <option value="fines">Штрафы</option>
            <option value="evac">Эвакуация</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#374151", marginBottom: 6 }}>Дата с</label>
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #d1d5db" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#374151", marginBottom: 6 }}>Дата по</label>
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #d1d5db" }}
          />
        </div>
        <button
          onClick={reload}
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #111827",
            background: loading ? "#9ca3af" : "#111827",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Загрузка…" : "Применить"}
        </button>
      </div>

      {error && <div style={{ color: "#b91c1c", marginTop: 12 }}>Ошибка: {error}</div>}

      {!loading && rows.length === 0 && (
        <div style={{ marginTop: 24, opacity: 0.7 }}>Нет данных. Измените фильтры и нажмите «Применить».</div>
      )}

      {rows.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16, marginTop: 20 }}>
          <div style={{ gridColumn: "span 12" }}>
            <KPI items={agg.kpis} />
          </div>

          <div
            style={{
              gridColumn: "span 12",
              minHeight: 360,
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,.08)",
            }}
          >
            <h3 style={{ marginBottom: 8, color: "#0f172a" }}>Динамика по дням</h3>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={agg.byDay} margin={{ top: 10, right: 24, bottom: 40, left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval="preserveEnd"
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  width={80}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => numCompact.format(Number(v) || 0)}
                />
                <Tooltip
                  formatter={(v, n) => [
                    ["Штрафы", "Взыскано", "Поступления"].includes(n)
                      ? moneyFmt.format(Number(v) || 0)
                      : numFmt.format(Number(v) || 0),
                    n,
                  ]}
                />
                <Legend />
                {tab === "fines" ? (
                  <>
                    <Line type="monotone" dataKey="Нарушения" dot={false} />
                    <Line type="monotone" dataKey="Постановления" dot={false} />
                    <Line type="monotone" dataKey="Штрафы" dot={false} />
                    <Line type="monotone" dataKey="Взыскано" dot={false} />
                  </>
                ) : (
                  <>
                    <Line type="monotone" dataKey="Выезды" dot={false} />
                    <Line type="monotone" dataKey="Эвакуации" dot={false} />
                    <Line type="monotone" dataKey="Поступления" dot={false} />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              gridColumn: "span 6",
              minHeight: 320,
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,.08)",
            }}
          >
            <h3 style={{ marginBottom: 8, color: "#0f172a" }}>
              {tab === "fines" ? "Структура взысканий" : "Структура выездов"}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={agg.pie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${numCompact.format(Number(value) || 0)}`}
                >
                  {agg.pie.map((_, i) => (
                    <Cell key={i} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n, p) => {
                    const kind = p?.payload?.kind || "num";
                    const precise =
                      kind === "rub" ? moneyFmt.format(Number(v) || 0) : numFmt.format(Number(v) || 0);
                    return [precise, n];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              gridColumn: "span 6",
              minHeight: 320,
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,.08)",
            }}
          >
            <h3 style={{ marginBottom: 8, color: "#0f172a" }}>Ключевые показатели</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={agg.bar} margin={{ top: 10, right: 24, bottom: 10, left: 16 }} barCategoryGap={24}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  width={80}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => numCompact.format(Number(v) || 0)}
                />
                <Tooltip
                  formatter={(v, n, p) => {
                    const kind = p?.payload?.kind || "num";
                    return [
                      kind === "rub" ? moneyFmt.format(Number(v) || 0) : numFmt.format(Number(v) || 0),
                      n,
                    ];
                  }}
                />
                <Bar dataKey="value" name="Значение" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ items }) {
  // Если хочешь 3 карточки в строку — поменяй gridColumn: "span 4"
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 12 }}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            gridColumn: "span 3",
            background: "#fff",
            borderRadius: 12,
            padding: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,.08)",
            color: "#111827",
          }}
        >
          <div style={{ fontSize: 12, color: "#6b7280" }}>{it.k}</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6, color: "#0f172a" }}>
            {fmt(it.kind, it.v)}
          </div>
        </div>
      ))}
    </div>
  );
}

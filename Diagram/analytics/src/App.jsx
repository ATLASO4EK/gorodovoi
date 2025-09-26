import { useEffect, useMemo, useRef, useState } from "react";
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
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

/**
 * Запуск:
 *  1) npm create vite@latest codd-charts -- --template react
 *  2) cd codd-charts && npm i recharts html2canvas xlsx
 *  3) замените src/App.jsx на этот файл
 *  4а) Vite proxy (рекомендуется), vite.config.js:
 *      import { defineConfig } from 'vite'
 *      import react from '@vitejs/plugin-react'
 *      export default defineConfig({
 *        plugins: [react()],
 *        server: { proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } } },
 *      })
 *      => оставьте API_BASE пустым ниже
 *  4б) ИЛИ .env: VITE_API_BASE=http://localhost:8000 и включите CORS во Flask
 *  5) npm run dev
 */

const API_BASE = import.meta.env.VITE_API_BASE || ""; // при Vite proxy — пусто

// ---------- форматтеры ----------
const numFmt = new Intl.NumberFormat("ru-RU");
const moneyFmt = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
const numCompact = new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 });
const rubCompact = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", notation: "compact", maximumFractionDigits: 1 });

function fmt(kind, v) {
  const n = Number(v) || 0;
  if (kind === "rub") return rubCompact.format(n);
  if (kind === "pct") return `${n.toFixed(1)}%`;
  return numCompact.format(n);
}

// ---------- утилиты ----------
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
async function fetchJson(url) {
  const res = await fetch(url);
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
  if (!ct.includes("application/json")) throw new Error(`Expected JSON, got ${ct || "unknown"}: ${text.slice(0, 200)}`);
  return JSON.parse(text);
}

// скользящее среднее
function movingAvg(arr, window = 7) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const a = Math.max(0, i - window + 1);
    const slice = arr.slice(a, i + 1).map((x) => Number(x) || 0);
    out.push(slice.reduce((s, v) => s + v, 0) / slice.length);
  }
  return out;
}

// ---------- RAW API ----------
async function fetchFines(dateStart, dateEnd) {
  const p = new URLSearchParams();
  if (dateStart) p.set("date", fmtISO(dateStart));
  if (dateEnd) p.set("date_end", fmtISO(dateEnd));
  const url = `${API_BASE}/api/v1/FinesStats${p.toString() ? `?${p.toString()}` : ""}`;
  const raw = await fetchJson(url);
  // [id, report_date, cams_violations_cum, decisions_cum, fines_sum_cum, collected_sum_cum]
  return raw
    .map((row) => {
      const hasId = row.length >= 6;
      const date = hasId ? row[1] : row[0];
      const cams = hasId ? row[2] : row[1];
      const decisions = hasId ? row[3] : row[2];
      const finesSum = hasId ? row[4] : row[3];
      const collected = hasId ? row[5] : row[4];
      return {
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
  // [id, event_date, tow_trucks_on_line, trips_count, evacuations_count, impound_revenue_rub]
  return raw
    .map((row) => {
      const hasId = row.length >= 6;
      const date = hasId ? row[1] : row[0];
      const tow = hasId ? row[2] : row[1];
      const trips = hasId ? row[3] : row[2];
      const evac = hasId ? row[4] : row[3];
      const revenue = hasId ? row[5] : row[4];
      return {
        date: asDate(date),
        tow: asNumber(tow),
        trips: asNumber(trips),
        evac: asNumber(evac),
        revenue: asNumber(revenue),
      };
    })
    .filter((r) => r.date);
}

// ---------- analytics API ----------
async function fetchAnalytics(table, dateStart, dateEnd) {
  const p = new URLSearchParams();
  p.set("table", table === "evac" ? "evacuate" : "fines");
  if (dateStart) p.set("date_start", fmtISO(dateStart));
  if (dateEnd) p.set("date_end", fmtISO(dateEnd));
  const url = `${API_BASE}/api/v1/analytics?${p.toString()}`;
  return fetchJson(url);
}

// ---------- экспорт ----------
async function exportPNG(node, filename = "chart.png") {
  if (!node) return;

  // приоритет: реальный график внутри
  const target =
    node.querySelector?.(".recharts-wrapper") ||
    node;

  const canvas = await html2canvas(target, {
    backgroundColor: "#ffffff",
    scale: window.devicePixelRatio || 2,
    useCORS: true,
    ignoreElements: (el) => el?.hasAttribute?.("data-export-ignore"),
    width: target.scrollWidth,
    height: target.scrollHeight,
    windowWidth: target.scrollWidth,
    windowHeight: target.scrollHeight,
  });
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
function escapeCSV(v) {
  if (v === undefined || v === null) return "";
  const s = String(v).replace(/\r?\n/g, " ");
  if (/[",;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function exportCSV(rows, filename = "data.csv") {
  if (!rows || rows.length === 0) return;
  let csv = "";
  if (Array.isArray(rows[0])) {
    csv += "Показатель,Значение\n";
    csv += rows.map(([k, v]) => `${escapeCSV(k)},${escapeCSV(v)}`).join("\n");
  } else {
    const headers = Object.keys(rows[0]);
    csv += headers.join(",") + "\n";
    csv += rows.map((r) => headers.map((h) => escapeCSV(r[h])).join(",")).join("\n");
  }
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function exportXLSX(rows, sheetName = "Sheet1", filename = "data.xlsx") {
  if (!rows || rows.length === 0) return;
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

// ---------- агрегаторы (тренды на byDay) ----------
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
  const trendVals = movingAvg(byDay.map((d) => d["Штрафы"]), 7);
  byDay.forEach((d, i) => (d["Тренд штрафов (7д)"] = trendVals[i]));

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
    pie: [
      { name: "Взыскано", value: sums.collected, kind: "rub" },
      { name: "Осталось", value: outstanding, kind: "rub" },
    ],
    barCounts: [
      { name: "Нарушения", value: sums.cams, kind: "num" },
      { name: "Постановления", value: sums.decisions, kind: "num" },
    ],
    barMoney: [
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
  const trendVals = movingAvg(byDay.map((d) => d["Поступления"]), 7);
  byDay.forEach((d, i) => (d["Тренд поступлений (7д)"] = trendVals[i]));

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
    pie: [
      { name: "Эвакуации", value: sums.evac, kind: "num" },
      { name: "Прочие выезды", value: rest, kind: "num" },
    ],
    barCounts: [
      { name: "Выезды", value: sums.trips, kind: "num" },
      { name: "Эвакуации", value: sums.evac, kind: "num" },
    ],
    barMoney: [{ name: "Поступления", value: sums.revenue, kind: "rub" }],
  };
}

// ---------- Таблица аналитики (данные из /api/v1/analytics) ----------
function AnalyticsSummaryTable({ table, analytics }) {
  if (!analytics) return null;
  const rows =
    table === "fines"
      ? [
          ["Нарушения (камера)", { v: analytics.sum_cam, kind: "num" }],
          ["Постановления", { v: analytics.sum_des, kind: "num" }],
          ["Сумма штрафов", { v: analytics.sum_fin, kind: "rub" }],
          ["Взыскано", { v: analytics.sum_col, kind: "rub" }],
          ["Доля взысканий", { v: analytics.per_col, kind: "pct" }],
          ["Кам./постановления", { v: analytics.per_cam_right, kind: "pct" }],
          ["Средний штраф/постановление", { v: analytics.avg_fin_des, kind: "rub" }],
        ]
      : [
          ["Выезды", { v: analytics.sum_trip, kind: "num" }],
          ["Эвакуации", { v: analytics.sum_evac, kind: "num" }],
          ["Поступления", { v: analytics.sum_rev, kind: "rub" }],
          ["Доля эвакуаций", { v: analytics.per_evac, kind: "pct" }],
          ["Средние поступления/эвакуацию", { v: analytics.avg_rev, kind: "rub" }],
        ];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,.08)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }} data-export-ignore>
        <h3 style={{ margin: 0, color: "#0f172a" }}>Сводка аналитики ({table === "fines" ? "Штрафы" : "Эвакуация"})</h3>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {rows.map(([label, { v, kind }], i) => (
            <tr key={i}>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee", color: "#374151" }}>{label}</td>
              <td
                style={{
                  padding: "8px 10px",
                  borderBottom: "1px solid #eee",
                  textAlign: "right",
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              >
                {fmt(kind, v)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- KPI (тянем из /api/v1/analytics) ----------
function KPIFromAnalytics({ table, analytics }) {
  if (!analytics) return null;
  const items =
    table === "fines"
      ? [
          { k: "Нарушения (камера)", v: analytics.sum_cam, kind: "num" },
          { k: "Постановления", v: analytics.sum_des, kind: "num" },
          { k: "Сумма штрафов", v: analytics.sum_fin, kind: "rub" },
          { k: "Взыскано", v: analytics.sum_col, kind: "rub" },
        ]
      : [
          { k: "Выезды", v: analytics.sum_trip, kind: "num" },
          { k: "Эвакуации", v: analytics.sum_evac, kind: "num" },
          { k: "Поступления", v: analytics.sum_rev, kind: "rub" },
          { k: "Доля эвакуаций", v: analytics.per_evac, kind: "pct" },
        ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 12 }}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            gridColumn: "span 3",
            backgroundColor: "#ffffff",
            color: "#111827",
            borderRadius: 12,
            padding: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,.08)",
          }}
        >
          <div style={{ fontSize: 12, color: "#6b7280" }}>{it.k}</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6, color: "#0f172a" }}>{fmt(it.kind, it.v)}</div>
        </div>
      ))}
    </div>
  );
}

// общий стиль для шапок карточек с кнопками
const headerRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  rowGap: 8,
  paddingRight: 4,
  marginBottom: 8,
};

// ---------- UI ----------
export default function App() {
  const [tab, setTab] = useState("fines"); // fines | evac
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  const [analytics, setAnalytics] = useState(null);
  const [anError, setAnError] = useState("");

  // refs для экспорта PNG
  const lineRef = useRef(null);
  const donutRef = useRef(null);
  const countsRef = useRef(null);
  const moneyRef = useRef(null);
  const analyticsRef = useRef(null);

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function reload() {
    setLoading(true);
    setError("");
    setAnError("");
    try {
      const ds = dateStart ? asDate(dateStart) : null;
      const de = dateEnd ? asDate(dateEnd) : null;

      const data = tab === "fines" ? await fetchFines(ds, de) : await fetchEvac(ds, de);
      setRows(data);

      const an = await fetchAnalytics(tab, ds, de);
      setAnalytics(an);
    } catch (e) {
      const msg = e.message || String(e);
      setError(msg);
      setRows([]);
      setAnalytics(null);
      setAnError(msg);
    } finally {
      setLoading(false);
    }
  }

  const agg = useMemo(() => (tab === "fines" ? aggregateFines(rows) : aggregateEvac(rows)), [tab, rows]);

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 1280,
        margin: "0 auto",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#111827",
        backgroundColor: "#f9fafb",
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>
        ЦОДД — диаграммы (build v6){" "}
        <span style={{ color: "#62a744", fontSize: 14, fontWeight: 600 }}>KPI из /api/v1/analytics</span>
      </h1>

      <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#374151", marginBottom: 6 }}>Таблица</label>
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid " + "#d1d5db", minWidth: 180 }}
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
            style={{ padding: 8, borderRadius: 8, border: "1px solid " + "#d1d5db" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#374151", marginBottom: 6 }}>Дата по</label>
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid " + "#d1d5db" }}
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

      {(error || anError) && <div style={{ color: "#b91c1c", marginTop: 12 }}>Ошибка: {error || anError}</div>}

      {!loading && rows.length === 0 && (
        <div style={{ marginTop: 24, opacity: 0.7 }}>Нет данных. Измените фильтры и нажмите «Применить».</div>
      )}

      {rows.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16, marginTop: 20 }}>
          {/* KPI из analytics */}
          <div style={{ gridColumn: "span 12" }}>
            <KPIFromAnalytics table={tab} analytics={analytics} />
          </div>

          {/* Линии + экспорт */}
          <div
            style={{
              gridColumn: "span 12",
              minHeight: 380,
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,.08)",
              overflow: "visible",
            }}
            ref={lineRef}
          >
            <div style={headerRowStyle}>
              <h3 style={{ margin: 0, color: "#0f172a" }}>Динамика по дням</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} data-export-ignore>
                <button onClick={() => exportPNG(lineRef.current, `trend_${tab}.png`)}>PNG</button>
                <button onClick={() => exportCSV(agg.byDay, `trend_${tab}.csv`)}>CSV</button>
                <button onClick={() => exportXLSX(agg.byDay, "Trend", `trend_${tab}.xlsx`)}>XLSX</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={agg.byDay} margin={{ top: 10, right: 28, bottom: 48, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#0f172a" }}
                  interval="preserveEnd"
                  angle={-30}
                  textAnchor="end"
                  height={52}
                />
                <YAxis
                  width={90}
                  tick={{ fontSize: 12, fill: "#0f172a" }}
                  tickFormatter={(v) => numCompact.format(Number(v) || 0)}
                />
                <Tooltip
                  formatter={(v, n) => [
                    ["Штрафы", "Взыскано", "Поступления", "Тренд штрафов (7д)", "Тренд поступлений (7д)"].includes(n)
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
                    <Line type="monotone" dataKey="Тренд штрафов (7д)" dot={false} strokeDasharray="5 5" />
                  </>
                ) : (
                  <>
                    <Line type="monotone" dataKey="Выезды" dot={false} />
                    <Line type="monotone" dataKey="Эвакуации" dot={false} />
                    <Line type="monotone" dataKey="Поступления" dot={false} />
                    <Line type="monotone" dataKey="Тренд поступлений (7д)" dot={false} strokeDasharray="5 5" />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Донат + экспорт */}
          <div
            style={{
              gridColumn: "span 6",
              minHeight: 340,
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,.08)",
              overflow: "visible",
            }}
            ref={donutRef}
          >
            <div style={headerRowStyle}>
              <h3 style={{ margin: 0, color: "#0f172a" }}>{tab === "fines" ? "Структура взысканий" : "Структура выездов"}</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} data-export-ignore>
                <button onClick={() => exportPNG(donutRef.current, `structure_${tab}.png`)}>PNG</button>
                <button
                  onClick={() =>
                    exportCSV(
                      agg.pie.map((x) => ({ Показатель: x.name, Значение: x.value })),
                      `structure_${tab}.csv`
                    )
                  }
                >
                  CSV
                </button>
                <button
                  onClick={() =>
                    exportXLSX(agg.pie.map((x) => ({ name: x.name, value: x.value })), "Structure", `structure_${tab}.xlsx`)
                  }
                >
                  XLSX
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={agg.pie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={100}
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${numCompact.format(Number(value) || 0)}`}
                >
                  {agg.pie.map((_, i) => (
                    <Cell key={i} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => {
                    const total = agg.pie.reduce((s, x) => s + Number(x.value || 0), 0) || 1;
                    const precise = numFmt.format(Number(v) || 0);
                    const perc = ((Number(v) || 0) / total) * 100;
                    return [`${precise} (${perc.toFixed(1)}%)`, n];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <ul style={{ marginTop: 8, fontSize: 12, color: "#374151", listStyle: "disc", paddingLeft: 20 }}>
              {agg.pie.map((s, i) => {
                const total = agg.pie.reduce((sum, x) => sum + Number(x.value || 0), 0) || 1;
                const perc = ((Number(s.value) || 0) / total) * 100;
                const precise = s.kind === "rub" ? moneyFmt.format(Number(s.value) || 0) : numFmt.format(Number(s.value) || 0);
                return (
                  <li key={i}>
                    {s.name}: <b>{precise}</b> ({perc.toFixed(1)}%)
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Бар: счётчики + экспорт */}
          <div
            style={{
              gridColumn: "span 3",
              minHeight: 340,
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,.08)",
              overflow: "visible",
            }}
            ref={countsRef}
          >
            <div style={headerRowStyle}>
              <h3 style={{ margin: 0, color: "#0f172a" }}>Показатели (шт.)</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} data-export-ignore>
                <button onClick={() => exportPNG(countsRef.current, `counts_${tab}.png`)}>PNG</button>
                <button onClick={() => exportCSV(agg.barCounts, `counts_${tab}.csv`)}>CSV</button>
                <button onClick={() => exportXLSX(agg.barCounts, "Counts", `counts_${tab}.xlsx`)}>XLSX</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={agg.barCounts} margin={{ top: 10, right: 12, bottom: 10, left: 8 }} barCategoryGap={24}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#0f172a" }} />
                <YAxis width={70} tick={{ fontSize: 12, fill: "#0f172a" }} tickFormatter={(v) => numCompact.format(Number(v) || 0)} />
                <Tooltip formatter={(v, n) => [numFmt.format(Number(v) || 0), n]} />
                <Bar dataKey="value" name="Значение" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Бар: деньги + экспорт */}
          <div
            style={{
              gridColumn: "span 3",
              minHeight: 340,
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,.08)",
              overflow: "visible",
            }}
            ref={moneyRef}
          >
            <div style={headerRowStyle}>
              <h3 style={{ margin: 0, color: "#0f172a" }}>Денежные показатели (₽)</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} data-export-ignore>
                <button onClick={() => exportPNG(moneyRef.current, `money_${tab}.png`)}>PNG</button>
                <button onClick={() => exportCSV(agg.barMoney, `money_${tab}.csv`)}>CSV</button>
                <button onClick={() => exportXLSX(agg.barMoney, "Money", `money_${tab}.xlsx`)}>XLSX</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={agg.barMoney} margin={{ top: 10, right: 12, bottom: 10, left: 8 }} barCategoryGap={24}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#0f172a" }} />
                <YAxis width={80} tick={{ fontSize: 12, fill: "#0f172a" }} tickFormatter={(v) => numCompact.format(Number(v) || 0)} />
                <Tooltip formatter={(v, n) => [moneyFmt.format(Number(v) || 0), n]} />
                <Bar dataKey="value" name="Сумма" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Таблица аналитики + экспорт */}
          <div style={{ gridColumn: "span 12" }} ref={analyticsRef}>
            <div style={headerRowStyle}>
              <h3 style={{ margin: 0, color: "#0f172a" }}>
                Сводка аналитики ({tab === "fines" ? "Штрафы" : "Эвакуация"})
              </h3>
              {analytics && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} data-export-ignore>
                  <button onClick={() => exportPNG(analyticsRef.current, `analytics_${tab}.png`)}>PNG</button>
                  <button
                    onClick={() => {
                      const rows = tab === "fines"
                        ? [
                            { metric: "Нарушения (камера)", value: analytics.sum_cam },
                            { metric: "Постановления", value: analytics.sum_des },
                            { metric: "Сумма штрафов", value: analytics.sum_fin },
                            { metric: "Взыскано", value: analytics.sum_col },
                            { metric: "Доля взысканий", value: analytics.per_col },
                            { metric: "Кам./постановления", value: analytics.per_cam_right },
                            { metric: "Средний штраф/постановление", value: analytics.avg_fin_des },
                          ]
                        : [
                            { metric: "Выезды", value: analytics.sum_trip },
                            { metric: "Эвакуации", value: analytics.sum_evac },
                            { metric: "Поступления", value: analytics.sum_rev },
                            { metric: "Доля эвакуаций", value: analytics.per_evac },
                            { metric: "Средние поступления/эвакуацию", value: analytics.avg_rev },
                          ];
                      exportCSV(rows, `analytics_${tab}.csv`);
                    }}
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => {
                      const rows = tab === "fines"
                        ? [
                            { metric: "Нарушения (камера)", value: analytics.sum_cam },
                            { metric: "Постановления", value: analytics.sum_des },
                            { metric: "Сумма штрафов", value: analytics.sum_fin },
                            { metric: "Взыскано", value: analytics.sum_col },
                            { metric: "Доля взысканий", value: analytics.per_col },
                            { metric: "Кам./постановления", value: analytics.per_cam_right },
                            { metric: "Средний штраф/постановление", value: analytics.avg_fin_des },
                          ]
                        : [
                            { metric: "Выезды", value: analytics.sum_trip },
                            { metric: "Эвакуации", value: analytics.sum_evac },
                            { metric: "Поступления", value: analytics.sum_rev },
                            { metric: "Доля эвакуаций", value: analytics.per_evac },
                            { metric: "Средние поступления/эвакуацию", value: analytics.avg_rev },
                          ];
                      exportXLSX(rows, "Analytics", `analytics_${tab}.xlsx`);
                    }}
                  >
                    XLSX
                  </button>
                </div>
              )}
            </div>
            <AnalyticsSummaryTable table={tab} analytics={analytics} />
          </div>
        </div>
      )}
    </div>
  );
}

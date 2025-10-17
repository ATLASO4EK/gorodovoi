import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
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
import "./../styles/MonitoringPage.css";

/**
 * Если используешь Vite proxy — оставь API_BASE пустым.
 * Иначе положи в .env: VITE_API_BASE=http://localhost:8000
 */
const API_BASE = import.meta.env.VITE_API_BASE || "";

/* =========================
   Форматтеры и утилиты
   ========================= */
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

function movingAvg(arr, window = 7) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const a = Math.max(0, i - window + 1);
    const slice = arr.slice(a, i + 1).map((x) => Number(x) || 0);
    out.push(slice.reduce((s, v) => s + v, 0) / slice.length);
  }
  return out;
}

// ---- color helpers ----
const COLORS = {
  green: "#10b981",
  blue: "#3b82f6",
  orange: "#f59e0b",
  purple: "#9333ea",
  red: "#ef4444",
  gray: "#9ca3af",
  trend: "#6b7280",
};

function getPieColor(name) {
  const map = {
    "Взыскано": COLORS.green,
    "Осталось": COLORS.orange,
    "Эвакуации": COLORS.orange,
    "Прочие выезды": COLORS.gray,
  };
  return map[name] || COLORS.blue;
}

function getBarColor(name, tab, kind) {
  if (tab === "fines") {
    if (kind === "counts") {
      if (name === "Нарушения") return COLORS.red;
      if (name === "Постановления") return COLORS.blue;
    } else {
      if (name === "Штрафы") return COLORS.purple;
      if (name === "Взыскано") return COLORS.green;
    }
  } else {
    if (kind === "counts") {
      if (name === "Выезды") return COLORS.blue;
      if (name === "Эвакуации") return COLORS.orange;
    } else {
      if (name === "Поступления") return COLORS.green;
    }
  }
  return COLORS.blue;
}

function LegendBullets({ items }) {
  return (
    <div className="legend-bullets">
      {items.map((it, i) => (
        <div key={i} className="legend-item">
          <span className="legend-bullet" style={{ background: it.color }} />
          <span className="legend-text">{it.name}</span>
        </div>
      ))}
    </div>
  );
}

/* =========================
   RAW API
   ========================= */
async function fetchFines(dateStart, dateEnd) {
  const p = new URLSearchParams();
  if (dateStart) p.set("date", fmtISO(dateStart));
  if (dateEnd) p.set("date_end", fmtISO(dateEnd));
  const url = `${API_BASE}/api/v1/FinesStats${p.toString() ? `?${p.toString()}` : ""}`;
  const raw = await fetchJson(url);
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

/* =========================
   analytics API
   ========================= */
async function fetchAnalytics(table, dateStart, dateEnd) {
  const p = new URLSearchParams();
  p.set("table", table === "evac" ? "evacuate" : "fines");
  if (dateStart) p.set("date_start", fmtISO(dateStart));
  if (dateEnd) p.set("date_end", fmtISO(dateEnd));
  const url = `${API_BASE}/api/v1/analytics?${p.toString()}`;
  return fetchJson(url);
}

/* =========================
   Экспорт CSV/XLSX
   ========================= */
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

/* =========================
   Импорт/Экспорт БД по API
   ========================= */
async function importDB(file, { allowCustomIds = false } = {}) {
  const qs = new URLSearchParams();
  if (allowCustomIds) qs.set("allow_custom_ids", "1");
  const url = `${API_BASE}/api/v1/admin/import-xlsx${qs.toString() ? "?" + qs.toString() : ""}`;
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(url, { method: "POST", body: fd });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  return JSON.parse(text);
}

async function exportDB({ sheets } = {}) {
  const qs = new URLSearchParams();
  if (sheets && sheets.length > 0) qs.set("sheets", sheets.join(","));
  const url = `${API_BASE}/api/v1/admin/export-xlsx${qs.toString() ? "?" + qs.toString() : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "export.xlsx";
  a.click();
  URL.revokeObjectURL(a.href);
}

/* =========================
   Агрегаторы
   ========================= */
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

/* =========================
   Таблица аналитики и KPI
   ========================= */
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
    <div className="analytics-table">
      <div className="analytics-header" data-export-ignore>
        <h3 className="chart-title">Сводка аналитики ({table === "fines" ? "Штрафы" : "Эвакуация"})</h3>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {rows.map(([label, { v, kind }], i) => (
            <tr key={i}>
              <td className="table-row table-label">{label}</td>
              <td className="table-row table-value">
                {fmt(kind, v)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
    <div className="kpi-grid">
      {items.map((it, i) => (
        <div key={i} className="kpi-item">
          <div className="kpi-label">{it.k}</div>
          <div className="kpi-value">{fmt(it.kind, it.v)}</div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   КОНСИСТЕНТНЫЙ PNG-ЭКСПОРТ: offscreen fixed React render
   ========================================================= */
async function exportPNGConsistent(renderChart, filename = "chart.png", { width = 1280, height = 720, dpr = 2 } = {}) {
  const host = document.createElement("div");
  Object.assign(host.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${width}px`,
    height: `${height}px`,
    background: "#fff",
    zIndex: "-1",
    overflow: "hidden",
    fontFamily: "Inter, system-ui, sans-serif",
  });
  document.body.appendChild(host);

  const root = ReactDOM.createRoot(host);
  root.render(renderChart({ width, height }));

  const waitFor = async (cond, timeout = 3000) => {
    const t0 = Date.now();
    while (!cond()) {
      if (Date.now() - t0 > timeout) break;
      await new Promise((r) => setTimeout(r, 30));
    }
  };
  await new Promise((r) => requestAnimationFrame(r));
  if (document.fonts?.ready) { try { await document.fonts.ready; } catch {} }
  await waitFor(() => host.querySelector("svg.recharts-surface"));
  await new Promise((r) => setTimeout(r, 50));

  const canvas = await html2canvas(host, {
    backgroundColor: "#ffffff",
    scale: dpr,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    useCORS: true,
  });

  root.unmount();
  document.body.removeChild(host);

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

/* =========================
   Рендеры для экспорта (фикс. размер + форматтеры + no animation)
   ========================= */
// ==== TREND (Штрафы) — суммы (₽): Штрафы + Взыскано ====
function renderTrendFinesMoney({ data }) {
  const C = { s: "#9333ea", c: "#10b981" };
  return ({ width, height }) => (
    <div style={{ width, height, background: "#fff" }}>
      <LineChart width={width} height={height} data={data} margin={{ top: 44, right: 24, bottom: 52, left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" angle={-30} textAnchor="end" height={52} tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => rubCompact.format(Number(v) || 0)} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v, n) => [moneyFmt.format(Number(v) || 0), n]} />
        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="Штрафы"   dot={false} isAnimationActive={false} stroke={C.s} strokeWidth={2} />
        <Line type="monotone" dataKey="Взыскано" dot={false} isAnimationActive={false} stroke={C.c} strokeWidth={2} />
      </LineChart>
    </div>
  );
}

// ==== TREND (Штрафы) — количества (шт.): Нарушения + Постановления ====
function renderTrendFinesCounts({ data }) {
  const C = { n: "#ef4444", p: "#3b82f6" };
  return ({ width, height }) => (
    <div style={{ width, height, background: "#fff" }}>
      <LineChart width={width} height={height} data={data} margin={{ top: 44, right: 24, bottom: 52, left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" angle={-30} textAnchor="end" height={52} tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => numCompact.format(Number(v) || 0)} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v, n) => [numFmt.format(Number(v) || 0), n]} />
        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="Нарушения"     dot={false} isAnimationActive={false} stroke={C.n} strokeWidth={2} />
        <Line type="monotone" dataKey="Постановления" dot={false} isAnimationActive={false} stroke={C.p} strokeWidth={2} />
      </LineChart>
    </div>
  );
}

// ==== TREND (Эвакуация) — количества (шт.): Выезды + Эвакуации ====
function renderTrendEvacCounts({ data }) {
  const C = { v: "#3b82f6", e: "#f59e0b" };
  return ({ width, height }) => (
    <div style={{ width, height, background: "#fff" }}>
      <LineChart width={width} height={height} data={data} margin={{ top: 44, right: 24, bottom: 52, left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" angle={-30} textAnchor="end" height={52} tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => numCompact.format(Number(v) || 0)} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v, n) => [numFmt.format(Number(v) || 0), n]} />
        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="Выезды"     dot={false} isAnimationActive={false} stroke={C.v} strokeWidth={2} />
        <Line type="monotone" dataKey="Эвакуации"  dot={false} isAnimationActive={false} stroke={C.e} strokeWidth={2} />
      </LineChart>
    </div>
  );
}

// ==== TREND (Эвакуация) — деньги (₽): Поступления ====
function renderTrendEvacMoney({ data }) {
  const C = { r: "#10b981" };
  return ({ width, height }) => (
    <div style={{ width, height, background: "#fff" }}>
      <LineChart width={width} height={height} data={data} margin={{ top: 44, right: 24, bottom: 52, left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" angle={-30} textAnchor="end" height={52} tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => rubCompact.format(Number(v) || 0)} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v, n) => [moneyFmt.format(Number(v) || 0), n]} />
        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="Поступления" dot={false} isAnimationActive={false} stroke={C.r} strokeWidth={2} />
      </LineChart>
    </div>
  );
}

function renderStructurePie({ data }) {
  const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];
  return ({ width, height }) => (
    <div style={{ width, height, background: "#fff" }}>
      <PieChart width={width} height={height}>
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{ fontSize: 12, color: "#111827" }}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx={width / 2}
          cy={height / 2 + 10}
          innerRadius={Math.min(width, height) * 0.22}
          outerRadius={Math.min(width, height) * 0.35}
          labelLine={false}
          label={({ name, value }) => `${name}: ${numCompact.format(Number(value) || 0)}`}
          isAnimationActive={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v, n) => {
            const total = data.reduce((s, x) => s + Number(x.value || 0), 0) || 1;
            const precise = numFmt.format(Number(v) || 0);
            const perc = ((Number(v) || 0) / total) * 100;
            return [`${precise} (${perc.toFixed(1)}%)`, n];
          }}
        />
      </PieChart>
    </div>
  );
}

function renderBarCounts({ data }) {
  const COLOR = "#2563eb";
  return ({ width, height }) => (
    <div style={{ width, height, background: "#fff" }}>
      <BarChart width={width} height={height} data={data} margin={{ top: 36, right: 16, bottom: 16, left: 12 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#0f172a" }} />
        <YAxis tickFormatter={(v) => numCompact.format(Number(v) || 0)} tick={{ fontSize: 12, fill: "#0f172a" }} />
        <Tooltip formatter={(v, n) => [numFmt.format(Number(v) || 0), n]} />
        <Legend
          verticalAlign="top"
          height={28}
          wrapperStyle={{ fontSize: 12, color: "#111827" }}
          payload={[{ value: "Значение", type: "square", color: COLOR }]}
        />
        <Bar dataKey="value" name="Значение" isAnimationActive={false} fill={COLOR} />
      </BarChart>
    </div>
  );
}

function renderBarMoney({ data }) {
  const COLOR = "#10b981";
  return ({ width, height }) => (
    <div style={{ width, height, background: "#fff" }}>
      <BarChart width={width} height={height} data={data} margin={{ top: 36, right: 16, bottom: 16, left: 12 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#0f172a" }} />
        <YAxis tickFormatter={(v) => rubCompact.format(Number(v) || 0)} tick={{ fontSize: 12, fill: "#0f172a" }} />
        <Tooltip formatter={(v, n) => [moneyFmt.format(Number(v) || 0), n]} />
        <Legend
          verticalAlign="top"
          height={28}
          wrapperStyle={{ fontSize: 12, color: "#111827" }}
          payload={[{ value: "Сумма", type: "square", color: COLOR }]}
        />
        <Bar dataKey="value" name="Сумма" isAnimationActive={false} fill={COLOR} />
      </BarChart>
    </div>
  );
}

/* =========================
   Основной компонент
   ========================= */
export default function App() {
  const [tab, setTab] = useState("fines");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  const [analytics, setAnalytics] = useState(null);
  const [anError, setAnError] = useState("");

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const lineRef = useRef(null);
  const donutRef = useRef(null);
  const countsRef = useRef(null);
  const moneyRef = useRef(null);
  const analyticsRef = useRef(null);

  const [impExpBusy, setImpExpBusy] = useState(false);
  const [impFile, setImpFile] = useState(null);
  const [allowIds, setAllowIds] = useState(false);
  const [selSheets, setSelSheets] = useState({ fines: true, evac: true, routes: true, lights: true });
  const [impExpMsg, setImpExpMsg] = useState("");

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

  async function handleImport() {
    setImpExpMsg("");
    if (!impFile) {
      setImpExpMsg("Выберите .xlsx файл для импорта.");
      return;
    }
    setImpExpBusy(true);
    try {
      const result = await importDB(impFile, { allowCustomIds: allowIds });
      setImpExpMsg(`Импорт: ${result.ok ? "успешно" : "ошибка"}\n` + JSON.stringify(result.summary || result.error, null, 2));
      await reload();
    } catch (e) {
      setImpExpMsg(`Ошибка импорта: ${e.message}`);
    } finally {
      setImpExpBusy(false);
    }
  }

  async function handleExport() {
    setImpExpMsg("");
    setImpExpBusy(true);
    try {
      const selected = Object.entries(selSheets)
        .filter(([, v]) => v)
        .map(([k]) => k);
      await exportDB({ sheets: selected.length ? selected : undefined });
      setImpExpMsg("Экспорт: файл export.xlsx скачан.");
    } catch (e) {
      setImpExpMsg(`Ошибка экспорта: ${e.message}`);
    } finally {
      setImpExpBusy(false);
    }
  }

  const span = (nDesktop, nMobile = 12) => ({
    gridColumn: `span ${isMobile ? nMobile : nDesktop}`,
  });

  return (
    <div className={`app-container ${isMobile ? "app-mobile" : ""}`}>
      <h1 className={`app-title ${isMobile ? "app-title-mobile" : ""}`}>
        ЦОДД — диаграммы (build v12){" "}
        <span className={`version-badge ${isMobile ? "version-badge-mobile" : ""}`}>KPI из /api/v1/analytics</span>
      </h1>

      {/* Фильтры */}
      <div className="filters-container">
        <div style={{ minWidth: 180 }}>
          <label className="filter-label">Таблица</label>
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value)}
            className="filter-select"
          >
            <option value="fines">Штрафы</option>
            <option value="evac">Эвакуация</option>
          </select>
        </div>

        <div style={{ minWidth: 160 }}>
          <label className="filter-label">Дата с</label>
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="filter-input"
          />
        </div>

        <div style={{ minWidth: 160 }}>
          <label className="filter-label">Дата по</label>
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="filter-input"
          />
        </div>

        <div>
          <label className="filter-label" style={{ visibility: "hidden" }}>.</label>
          <button
            onClick={reload}
            disabled={loading}
            className="reload-button"
          >
            {loading ? "Загрузка…" : "Применить"}
          </button>
        </div>
      </div>

      {(error || anError) && <div className="error-message">Ошибка: {error || anError}</div>}

      {!loading && rows.length === 0 && (
        <div className="no-data">Нет данных. Измените фильтры и нажмите «Применить».</div>
      )}

      {rows.length > 0 && (
        <div className="grid-container">
          {/* KPI */}
          <div style={span(12)}>
            <KPIFromAnalytics table={tab} analytics={analytics} />
          </div>

          {tab === "fines" && (
            <>
              {/* Суммы (₽): Штрафы + Взыскано */}
              <div className={`chart-card ${isMobile ? "chart-card-mobile" : ""}`} style={span(12)}>
                <div className="chart-header">
                  <h3 className={`chart-title ${isMobile ? "chart-title-mobile" : ""}`}>Динамика: суммы (₽)</h3>
                  <div className="export-buttons" data-export-ignore>
                    <button
                      onClick={() =>
                        exportPNGConsistent(
                          renderTrendFinesMoney({ data: agg.byDay }),
                          `trend_fines_money.png`,
                          { width: 1280, height: 720 }
                        )
                      }
                    >PNG</button>
                    <button onClick={() => exportCSV(agg.byDay.map(d => ({ date: d.date, Штрафы: d["Штрафы"], Взыскано: d["Взыскано"] })), `trend_fines_money.csv`)}>CSV</button>
                    <button onClick={() => exportXLSX(agg.byDay.map(d => ({ date: d.date, Штрафы: d["Штрафы"], Взыскано: d["Взыскано"] })), "Trend (₽)", `trend_fines_money.xlsx`)}>XLSX</button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={isMobile ? 270 : 400}>
                  <LineChart
                    data={agg.byDay}
                    margin={{ top: isMobile ? 36 : 44, right: 20, bottom: isMobile ? 36 : 48, left: 12 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: isMobile ? 10 : 12, fill: "#0f172a" }} interval="preserveEnd" angle={-30} textAnchor="end" height={isMobile ? 40 : 52} />
                    <YAxis width={isMobile ? 70 : 90} tick={{ fontSize: isMobile ? 10 : 12, fill: "#0f172a" }} tickFormatter={(v) => rubCompact.format(Number(v) || 0)} />
                    <Tooltip formatter={(v, n) => [moneyFmt.format(Number(v) || 0), n]} />
                    <Legend verticalAlign="top" height={isMobile ? 28 : 36} wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                    <Line type="monotone" dataKey="Штрафы"   dot={false} stroke="#9333ea" strokeWidth={2} />
                    <Line type="monotone" dataKey="Взыскано" dot={false} stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Количества (шт.): Нарушения + Постановления */}
              <div className={`chart-card ${isMobile ? "chart-card-mobile" : ""}`} style={span(12)}>
                <div className="chart-header">
                  <h3 className={`chart-title ${isMobile ? "chart-title-mobile" : ""}`}>Динамика: количества (шт.)</h3>
                  <div className="export-buttons" data-export-ignore>
                    <button
                      onClick={() =>
                        exportPNGConsistent(
                          renderTrendFinesCounts({ data: agg.byDay }),
                          `trend_fines_counts.png`,
                          { width: 1280, height: 720 }
                        )
                      }
                    >PNG</button>
                    <button onClick={() => exportCSV(agg.byDay.map(d => ({ date: d.date, Нарушения: d["Нарушения"], Постановления: d["Постановления"] })), `trend_fines_counts.csv`)}>CSV</button>
                    <button onClick={() => exportXLSX(agg.byDay.map(d => ({ date: d.date, Нарушения: d["Нарушения"], Постановления: d["Постановления"] })), "Trend (шт.)", `trend_fines_counts.xlsx`)}>XLSX</button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={isMobile ? 270 : 400}>
                  <LineChart
                    data={agg.byDay}
                    margin={{ top: isMobile ? 36 : 44, right: 20, bottom: isMobile ? 36 : 48, left: 12 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: isMobile ? 10 : 12, fill: "#0f172a" }} interval="preserveEnd" angle={-30} textAnchor="end" height={isMobile ? 40 : 52} />
                    <YAxis width={isMobile ? 60 : 80} tick={{ fontSize: isMobile ? 10 : 12, fill: "#0f172a" }} tickFormatter={(v) => numCompact.format(Number(v) || 0)} />
                    <Tooltip formatter={(v, n) => [numFmt.format(Number(v) || 0), n]} />
                    <Legend verticalAlign="top" height={isMobile ? 28 : 36} wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                    <Line type="monotone" dataKey="Нарушения"     dot={false} stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="Постановления" dot={false} stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* === Тренды: для ЭВАКУАЦИИ две карточки === */}
          {tab === "evac" && (
            <>
              {/* Количества (шт.): Выезды + Эвакуации */}
              <div className={`chart-card ${isMobile ? "chart-card-mobile" : ""}`} style={span(12)}>
                <div className="chart-header">
                  <h3 className={`chart-title ${isMobile ? "chart-title-mobile" : ""}`}>Динамика: выезды и эвакуации (шт.)</h3>
                  <div className="export-buttons" data-export-ignore>
                    <button
                      onClick={() =>
                        exportPNGConsistent(
                          renderTrendEvacCounts({ data: agg.byDay }),
                          `trend_evac_counts.png`,
                          { width: 1280, height: 720 }
                        )
                      }
                    >PNG</button>
                    <button onClick={() => exportCSV(agg.byDay.map(d => ({ date: d.date, Выезды: d["Выезды"], Эвакуации: d["Эвакуации"] })), `trend_evac_counts.csv`)}>CSV</button>
                    <button onClick={() => exportXLSX(agg.byDay.map(d => ({ date: d.date, Выезды: d["Выезды"], Эвакуации: d["Эвакуации"] })), "Trend (шт.)", `trend_evac_counts.xlsx`)}>XLSX</button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={isMobile ? 270 : 400}>
                  <LineChart
                    data={agg.byDay}
                    margin={{ top: isMobile ? 36 : 44, right: 20, bottom: isMobile ? 36 : 48, left: 12 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: isMobile ? 10 : 12, fill: "#0f172a" }} interval="preserveEnd" angle={-30} textAnchor="end" height={isMobile ? 40 : 52} />
                    <YAxis width={isMobile ? 60 : 80} tick={{ fontSize: isMobile ? 10 : 12, fill: "#0f172a" }} tickFormatter={(v) => numCompact.format(Number(v) || 0)} />
                    <Tooltip formatter={(v, n) => [numFmt.format(Number(v) || 0), n]} />
                    <Legend verticalAlign="top" height={isMobile ? 28 : 36} wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                    <Line type="monotone" dataKey="Выезды"    dot={false} stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Эвакуации" dot={false} stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Деньги (₽): Поступления */}
              <div className={`chart-card ${isMobile ? "chart-card-mobile" : ""}`} style={span(12)}>
                <div className="chart-header">
                  <h3 className={`chart-title ${isMobile ? "chart-title-mobile" : ""}`}>Динамика: поступления (₽)</h3>
                  <div className="export-buttons" data-export-ignore>
                    <button
                      onClick={() =>
                        exportPNGConsistent(
                          renderTrendEvacMoney({ data: agg.byDay }),
                          `trend_evac_money.png`,
                          { width: 1280, height: 720 }
                        )
                      }
                    >PNG</button>
                    <button onClick={() => exportCSV(agg.byDay.map(d => ({ date: d.date, Поступления: d["Поступления"] })), `trend_evac_money.csv`)}>CSV</button>
                    <button onClick={() => exportXLSX(agg.byDay.map(d => ({ date: d.date, Поступления: d["Поступления"] })), "Trend (₽)", `trend_evac_money.xlsx`)}>XLSX</button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={isMobile ? 270 : 400}>
                  <LineChart
                    data={agg.byDay}
                    margin={{ top: isMobile ? 36 : 44, right: 20, bottom: isMobile ? 36 : 48, left: 12 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: isMobile ? 10 : 12, fill: "#0f172a" }} interval="preserveEnd" angle={-30} textAnchor="end" height={isMobile ? 40 : 52} />
                    <YAxis width={isMobile ? 70 : 90} tick={{ fontSize: isMobile ? 10 : 12, fill: "#0f172a" }} tickFormatter={(v) => rubCompact.format(Number(v) || 0)} />
                    <Tooltip formatter={(v, n) => [moneyFmt.format(Number(v) || 0), n]} />
                    <Legend verticalAlign="top" height={isMobile ? 28 : 36} wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                    <Line type="monotone" dataKey="Поступления" dot={false} stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* Структура (пирог) + экспорт */}
          <div className="chart-card" style={span(isMobile ? 12 : 6)} ref={donutRef}>
            <div className="chart-header">
              <h3 className="chart-title">
                {tab === "fines" ? "Структура взысканий" : "Структура выездов"}
              </h3>
              <div className="export-buttons" data-export-ignore>
                <button onClick={() => exportPNGConsistent(renderStructurePie({ data: agg.pie }), `structure_${tab}.png`, { width: 1200, height: 800 })}>PNG</button>
                <button onClick={() => exportCSV(agg.pie.map((x) => ({ Показатель: x.name, Значение: x.value })), `structure_${tab}.csv`)}>CSV</button>
                <button onClick={() => exportXLSX(agg.pie.map((x) => ({ name: x.name, value: x.value })), "Structure", `structure_${tab}.xlsx`)}>XLSX</button>
              </div>
            </div>

            <div style={{ marginTop: 8 }} data-export-ignore>
              <LegendBullets items={agg.pie.map(p => ({ name: p.name, color: getPieColor(p.name) }))} />
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
                  isAnimationActive={false}
                >
                  {agg.pie.map((slice, i) => (
                    <Cell key={i} fill={getPieColor(slice.name)} />
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
              </PieChart>
            </ResponsiveContainer>

            <ul className="pie-list">
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

          {/* Бар: количества (шт.) + экспорт */}
          <div className="chart-card" style={span(isMobile ? 12 : 3)} ref={countsRef}>
            <div className="chart-header">
              <h3 className="chart-title">Показатели (шт.)</h3>
              <div className="export-buttons" data-export-ignore>
                <button onClick={() => exportPNGConsistent(renderBarCounts({ data: agg.barCounts }), `counts_${tab}.png`, { width: 900, height: 700 })}>PNG</button>
                <button onClick={() => exportCSV(agg.barCounts, `counts_${tab}.csv`)}>CSV</button>
                <button onClick={() => exportXLSX(agg.barCounts, "Counts", `counts_${tab}.xlsx`)}>XLSX</button>
              </div>
            </div>

            <div style={{ marginTop: 8 }} data-export-ignore>
              <LegendBullets items={agg.barCounts.map(b => ({ name: b.name, color: getBarColor(b.name, tab, "counts") }))} />
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={agg.barCounts} margin={{ top: 10, right: 12, bottom: 10, left: 8 }} barCategoryGap={24}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#0f172a" }} />
                <YAxis width={70} tick={{ fontSize: 12, fill: "#0f172a" }} tickFormatter={(v) => numCompact.format(Number(v) || 0)} />
                <Tooltip formatter={(v, n) => [numFmt.format(Number(v) || 0), n]} />
                <Bar dataKey="value" name="Значение" isAnimationActive={false}>
                  {agg.barCounts.map((entry, idx) => (
                    <Cell key={`c-${idx}`} fill={getBarColor(entry.name, tab, "counts")} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Бар: деньги (₽) + экспорт */}
          <div className="chart-card" style={span(isMobile ? 12 : 3)} ref={moneyRef}>
            <div className="chart-header">
              <h3 className="chart-title">Денежные показатели (₽)</h3>
              <div className="export-buttons" data-export-ignore>
                <button onClick={() => exportPNGConsistent(renderBarMoney({ data: agg.barMoney }), `money_${tab}.png`, { width: 900, height: 700 })}>PNG</button>
                <button onClick={() => exportCSV(agg.barMoney, `money_${tab}.csv`)}>CSV</button>
                <button onClick={() => exportXLSX(agg.barMoney, "Money", `money_${tab}.xlsx`)}>XLSX</button>
              </div>
            </div>

            <div style={{ marginTop: 8 }} data-export-ignore>
              <LegendBullets items={agg.barMoney.map(b => ({ name: b.name, color: getBarColor(b.name, tab, "money") }))} />
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={agg.barMoney} margin={{ top: 10, right: 12, bottom: 10, left: 8 }} barCategoryGap={24}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#0f172a" }} />
                <YAxis width={80} tick={{ fontSize: 12, fill: "#0f172a" }} tickFormatter={(v) => rubCompact.format(Number(v) || 0)} />
                <Tooltip formatter={(v, n) => [moneyFmt.format(Number(v) || 0), n]} />
                <Bar dataKey="value" name="Сумма" isAnimationActive={false}>
                  {agg.barMoney.map((entry, idx) => (
                    <Cell key={`m-${idx}`} fill={getBarColor(entry.name, tab, "money")} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Таблица аналитики */}
          <div style={span(12)} ref={analyticsRef}>
            <div className="analytics-header">
              <h3 className={`chart-title ${isMobile ? "chart-title-mobile" : ""}`}>
                Сводка аналитики ({tab === "fines" ? "Штрафы" : "Эвакуация"})
              </h3>
              {analytics && (
                <div className="export-buttons" data-export-ignore>
                  <button
                    onClick={() =>
                      exportPNGConsistent(
                        ({ width, height }) => (
                          <div style={{ width, height, background: "#fff", padding: 24, boxSizing: "border-box", fontFamily: "Inter, system-ui, sans-serif" }}>
                            <h3 style={{ margin: 0, marginBottom: 12, color: "#0f172a" }}>
                              Сводка аналитики ({tab === "fines" ? "Штрафы" : "Эвакуация"})
                            </h3>
                            <AnalyticsSummaryTable table={tab} analytics={analytics} />
                          </div>
                        ),
                        `analytics_${tab}.png`,
                        { width: 1280, height: 720 }
                      )
                    }
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => {
                      const rows =
                        tab === "fines"
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
                      const rows =
                        tab === "fines"
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

          {/* Импорт / Экспорт */}
          <div style={span(12)}>
            <div className="import-export-panel">
              <h3 className={`chart-title ${isMobile ? "chart-title-mobile" : ""}`}>Импорт / Экспорт базы</h3>

              <div className="sheet-selection">
                <label>
                  <input
                    type="checkbox"
                    checked={selSheets.fines}
                    onChange={(e) => setSelSheets((s) => ({ ...s, fines: e.target.checked }))}
                  />{" "}
                  Штрафы
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={selSheets.evac}
                    onChange={(e) => setSelSheets((s) => ({ ...s, evac: e.target.checked }))}
                  />{" "}
                  Эвакуация
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={selSheets.routes}
                    onChange={(e) => setSelSheets((s) => ({ ...s, routes: e.target.checked }))}
                  />{" "}
                  Эвакуация маршрут
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={selSheets.lights}
                    onChange={(e) => setSelSheets((s) => ({ ...s, lights: e.target.checked }))}
                  />{" "}
                  Реестр светофоров
                </label>
              </div>

              <div className="import-controls">
                <input type="file" accept=".xlsx,.xls" onChange={(e) => setImpFile(e.target.files?.[0] || null)} />
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={allowIds} onChange={(e) => setAllowIds(e.target.checked)} />
                  Разрешить собственные ID при импорте
                </label>
                <button
                  onClick={handleImport}
                  disabled={impExpBusy || !impFile}
                  className="import-button"
                >
                  Загрузить в БД
                </button>
              </div>

              <div className="export-controls">
                <button
                  onClick={handleExport}
                  disabled={impExpBusy}
                  className="export-button"
                >
                  Выгрузить в XLSX
                </button>
                <span style={{ color: "#6b7280", fontSize: 12 }}>Если не выбрать ничего — выгрузятся все листы.</span>
              </div>

              {impExpMsg && (
                <pre className={`import-message ${isMobile ? "import-message-mobile" : ""}`}>
                  {impExpMsg}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
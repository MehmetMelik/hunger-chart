"use client";

import React, { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export default function HungerMinWageUsdChart() {
  const [useLogScale, setUseLogScale] = useState(false);

  // ---- Data ----
  const labels = [
    2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013,
    2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
  ];

  // Açlık Sınırı ($) from bilbilgilen (2002–2025) + derived 2026 ($700.70)
  const hungerUSD = [
    212.06, 242.09, 338.84, 386.16, 410.92, 444.40, 594.08, 478.30, 545.66,
    559.69, 508.45, 563.44, 505.12, 535.10, 490.99, 417.82, 428.17, 376.13,
    372.41, 359.84, 315.75, 470.95, 495.68, 627.79, 700.70,
  ];

  // Açlık Sınırı (Kaç AÜ) from table + derived 2026 (30126/28075 ≈ 1.0730)
  const hungerOverMinwage = [
    1.88, 1.77, 1.49, 1.49, 1.46, 1.50, 1.38, 1.35, 1.36, 1.32, 1.30, 1.25,
    1.23, 1.26, 1.11, 1.05, 1.00, 0.99, 0.95, 0.94, 1.00, 1.04, 0.89, 1.00,
    30126 / 28075,
  ];

  // Asgari Ücret ($) derived for 2002–2025; 2026 given $653
  const minWageUSD = hungerUSD.map((v, i) => {
    const derived = v / hungerOverMinwage[i];
    return isFiniteNumber(derived) ? +derived.toFixed(2) : NaN;
  });
  minWageUSD[minWageUSD.length - 1] = 653.0;

  // Ratio line: Açlık / Asgari (dimensionless). For 2026 this equals 30126/28075.
  const ratio = hungerUSD.map((h, i) => {
    const a = minWageUSD[i];
    const r = h / a;
    return isFiniteNumber(r) ? +r.toFixed(3) : NaN;
  });

  // ---- Formatting helpers ----
  const usd = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    []
  );

  const ratioFmt = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
      }),
    []
  );

  // ---- Chart data + style ----
  const data = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: "Açlık Sınırı ($)",
          data: hungerUSD,
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 2,
          pointHoverRadius: 6,
          yAxisID: "yUSD",
          fill: true,
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart;
            const { chartArea } = chart;
            if (!chartArea) return "rgba(99, 102, 241, 0.15)";
            const g = chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, "rgba(99, 102, 241, 0.35)");
            g.addColorStop(1, "rgba(99, 102, 241, 0.02)");
            return g;
          },
        },
        {
          label: "Asgari Ücret ($)",
          data: minWageUSD,
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 2,
          pointHoverRadius: 6,
          yAxisID: "yUSD",
          fill: true,
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart;
            const { chartArea } = chart;
            if (!chartArea) return "rgba(34, 197, 94, 0.12)";
            const g = chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, "rgba(34, 197, 94, 0.28)");
            g.addColorStop(1, "rgba(34, 197, 94, 0.02)");
            return g;
          },
        },
        {
          label: "Oran: Açlık / Asgari",
          data: ratio,
          borderWidth: 2,
          tension: 0.25,
          pointRadius: 0,
          pointHoverRadius: 4,
          yAxisID: "yRatio",
          // make it visually distinct (no fill)
          fill: false,
        },
      ],
    };
  }, [hungerUSD, minWageUSD, ratio]);

  // Tooltip label that fixes your Vercel build:
  // ctx.parsed.y can be number|null, so we guard it.
  const tooltipLabel = (ctx: TooltipItem<"line">) => {
    const y = ctx.parsed.y; // number | null
    if (y === null || !Number.isFinite(y)) return ` ${ctx.dataset.label}: —`;

    const isRatioSeries = ctx.dataset.yAxisID === "yRatio";
    return isRatioSeries
      ? ` ${ctx.dataset.label}: ${ratioFmt.format(y)}`
      : ` ${ctx.dataset.label}: ${usd.format(y)}`;
  };

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "rgba(255,255,255,0.85)",
            boxWidth: 14,
            boxHeight: 14,
            padding: 18,
          },
        },
        tooltip: {
          backgroundColor: "rgba(10, 14, 25, 0.95)",
          borderColor: "rgba(255,255,255,0.12)",
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: tooltipLabel,
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: { color: "rgba(255,255,255,0.70)", maxRotation: 0, autoSkip: true },
        },

        // Left axis: USD (linear/log toggle)
        yUSD: {
          type: useLogScale ? "logarithmic" : "linear",
          position: "left",
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: {
            color: "rgba(255,255,255,0.70)",
            // Chart.js log scale ticks can pass non-numbers; guard hard.
            callback: (v) => {
              const n = typeof v === "string" ? Number(v) : Number(v);
              return Number.isFinite(n) ? usd.format(n) : "";
            },
          },
          // log scale can't include 0 or negative
          min: useLogScale ? 1 : undefined,
        },

        // Right axis: Ratio
        yRatio: {
          type: "linear",
          position: "right",
          grid: { drawOnChartArea: false }, // avoid messy double-grid
          ticks: {
            color: "rgba(255,255,255,0.70)",
            callback: (v) => {
              const n = typeof v === "string" ? Number(v) : Number(v);
              return Number.isFinite(n) ? ratioFmt.format(n) : "";
            },
          },
          suggestedMin: 0.7,
          suggestedMax: 2.0,
        },
      },
    }),
    [useLogScale, usd, ratioFmt]
  );

  return (
    <section style={{ maxWidth: 1100, margin: "40px auto", padding: "0 16px" }}>
      <div
        style={{
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.10)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 20, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: 18, color: "rgba(255,255,255,0.92)" }}>
              Türkiye — Açlık Sınırı vs Asgari Ücret (USD) + Oran
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
              2026: Açlık $700.70 (30126 TL), Asgari $653 (28075 TL) — oran ≈ {(30126 / 28075).toFixed(2)}
            </p>
          </div>

          {/* Toggle */}
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={useLogScale}
              onChange={(e) => setUseLogScale(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
              Log scale (USD)
            </span>
          </label>
        </div>

        <div style={{ height: 520, padding: "0 16px 16px" }}>
          <Line data={data} options={options} />
        </div>
      </div>
    </section>
  );
}

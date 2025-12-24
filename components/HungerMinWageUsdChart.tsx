"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
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
  const labels = [
    2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013,
    2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
  ];

  const hungerUSD = [
    212.06, 242.09, 338.84, 386.16, 410.92, 444.40, 594.08, 478.30, 545.66,
    559.69, 508.45, 563.44, 505.12, 535.10, 490.99, 417.82, 428.17, 376.13,
    372.41, 359.84, 315.75, 470.95, 495.68, 627.79, 700.70,
  ];

  const hungerOverMinwage = [
    1.88, 1.77, 1.49, 1.49, 1.46, 1.50, 1.38, 1.35, 1.36, 1.32, 1.30, 1.25,
    1.23, 1.26, 1.11, 1.05, 1.00, 0.99, 0.95, 0.94, 1.00, 1.04, 0.89, 1.00,
    30126 / 28075,
  ];

  const minWageUSD = hungerUSD.map((v, i) => {
    const derived = v / hungerOverMinwage[i];
    return isFiniteNumber(derived) ? +derived.toFixed(2) : NaN;
  });
  minWageUSD[minWageUSD.length - 1] = 653.0;

  const ratio = hungerUSD.map((h, i) => {
    const a = minWageUSD[i];
    const r = h / a;
    return isFiniteNumber(r) ? +r.toFixed(3) : NaN;
  });

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
    () => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }),
    []
  );

  const tooltipLabel = (ctx: TooltipItem<"line">) => {
    const y = ctx.parsed.y; // number | null
    if (y === null || !Number.isFinite(y)) return ` ${ctx.dataset.label}: —`;
    const isRatioSeries = ctx.dataset.yAxisID === "yRatio";
    return isRatioSeries
      ? ` ${ctx.dataset.label}: ${ratioFmt.format(y)}`
      : ` ${ctx.dataset.label}: ${usd.format(y)}`;
  };

  const data = useMemo(
    () => ({
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
          // explicitly set a readable stroke too (helps accessibility)
          borderColor: "rgba(99, 102, 241, 0.95)",
          pointBackgroundColor: "rgba(99, 102, 241, 0.95)",
          backgroundColor: (ctx: any) => {
            const chartArea = ctx.chart?.chartArea;
            if (!chartArea) return "rgba(99, 102, 241, 0.15)";
            const g = ctx.chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
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
          borderColor: "rgba(34, 197, 94, 0.95)",
          pointBackgroundColor: "rgba(34, 197, 94, 0.95)",
          backgroundColor: (ctx: any) => {
            const chartArea = ctx.chart?.chartArea;
            if (!chartArea) return "rgba(34, 197, 94, 0.12)";
            const g = ctx.chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, "rgba(34, 197, 94, 0.28)");
            g.addColorStop(1, "rgba(34, 197, 94, 0.02)");
            return g;
          },
        },
        {
          label: "Oran: Açlık / Asgari",
          data: ratio,
          yAxisID: "yRatio",
          borderWidth: 2,
          tension: 0.25,
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: false,

          // ✅ make it visible on dark background
          borderColor: "rgba(245, 158, 11, 0.95)", // amber
          pointBackgroundColor: "rgba(245, 158, 11, 0.95)",
          borderDash: [6, 4],
        },
      ],
    }),
    [labels, hungerUSD, minWageUSD, ratio]
  );

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
          callbacks: { label: tooltipLabel },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: { color: "rgba(255,255,255,0.70)", maxRotation: 0, autoSkip: true },
        },
        yUSD: {
          type: "linear",
          position: "left",
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: {
            color: "rgba(255,255,255,0.70)",
            callback: (v) => {
              const n = typeof v === "string" ? Number(v) : Number(v);
              return Number.isFinite(n) ? usd.format(n) : "";
            },
          },
          title: {
            display: true,
            text: "USD ($)",
            color: "rgba(255,255,255,0.70)",
          },
        },
        yRatio: {
          type: "linear",
          position: "right",
          grid: { drawOnChartArea: false }, // keep it clean
          ticks: {
            color: "rgba(255,255,255,0.70)",
            callback: (v) => {
              const n = typeof v === "string" ? Number(v) : Number(v);
              return Number.isFinite(n) ? ratioFmt.format(n) : "";
            },
          },
          title: {
            display: true,
            text: "Oran (Açlık / Asgari)",
            color: "rgba(255,255,255,0.70)",
          },
          // optional: helps keep it readable
          suggestedMin: 0.8,
          suggestedMax: 2.0,
        },
      },
    }),
    [usd, ratioFmt]
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
        <div style={{ padding: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: "rgba(255,255,255,0.92)" }}>
            Türkiye — Açlık Sınırı vs Asgari Ücret (USD) + Oran
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
            Oran çizgisi sağ eksendedir (Açlık/Asgari). 2026 oran ≈ {(30126 / 28075).toFixed(2)}.
          </p>
        </div>

        <div style={{ height: 520, padding: "0 16px 16px" }}>
          <Line data={data} options={options} />
        </div>
      </div>
    </section>
  );
}

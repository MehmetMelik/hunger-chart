"use client";

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

export default function HungerMinWageUsdChart() {
  // Years
  const labels = [
    2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013,
    2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
  ];

  // Açlık Sınırı ($) — from bilbilgilen table (2002–2025) + derived 2026 ($700.70)
  const hungerUSD = [
    212.06, 242.09, 338.84, 386.16, 410.92, 444.40, 594.08, 478.30, 545.66,
    559.69, 508.45, 563.44, 505.12, 535.10, 490.99, 417.82, 428.17, 376.13,
    372.41, 359.84, 315.75, 470.95, 495.68, 627.79, 700.70,
  ];

  // Açlık Sınırı (Kaç AÜ) — from table (2002–2025) + derived 2026 from TL numbers:
  // 2026 ratio = 30126 / 28075 ≈ 1.0730
  const hungerOverMinwage = [
    1.88, 1.77, 1.49, 1.49, 1.46, 1.50, 1.38, 1.35, 1.36, 1.32, 1.30, 1.25,
    1.23, 1.26, 1.11, 1.05, 1.00, 0.99, 0.95, 0.94, 1.00, 1.04, 0.89, 1.00,
    30126 / 28075,
  ];

  // Asgari Ücret ($) — derived for 2002–2025 from table ratios; for 2026 use given $653
  const minWageUSD = hungerUSD.map((v, i) => {
    const derived = v / hungerOverMinwage[i];
    return Number.isFinite(derived) ? +derived.toFixed(2) : NaN;
  });
  minWageUSD[minWageUSD.length - 1] = 653.0;

  const data = {
    labels,
    datasets: [
      {
        label: "Açlık Sınırı ($)",
        data: hungerUSD,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 6,
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
    ],
  };

  const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const options: ChartOptions<"line"> = {
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
          label: (ctx) => ` ${ctx.dataset.label}: ${usd.format(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: { color: "rgba(255,255,255,0.70)", maxRotation: 0, autoSkip: true },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: {
          color: "rgba(255,255,255,0.70)",
          callback: (v) => usd.format(Number(v)),
        },
      },
    },
  };

  return (
    <section
      style={{
        maxWidth: 1100,
        margin: "40px auto",
        padding: "0 16px",
      }}
    >
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
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
            <h2 style={{ margin: 0, fontSize: 18, color: "rgba(255,255,255,0.92)" }}>
              Türkiye — Açlık Sınırı vs Asgari Ücret (USD)
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
              2026: Açlık $700.70 (30126 TL), Asgari $653 (28075 TL) — FX implied from your inputs
            </p>
          </div>
        </div>

        <div style={{ height: 520, padding: "0 16px 16px" }}>
          <Line data={data} options={options} />
        </div>
      </div>
    </section>
  );
}

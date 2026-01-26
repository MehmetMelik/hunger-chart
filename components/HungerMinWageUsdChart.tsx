"use client";

import React, { useCallback, useMemo, useState } from "react";
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
  type LegendItem,
  type ScriptableContext,
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

const labels = [
  2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014,
  2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
];

// Annual CPI-U (1982-84 = 100) from BLS; 2024-2026 use ~2% projections to keep comparisons stable.
const cpiIndex = [
  179.9, 184.0, 188.9, 195.3, 201.6, 207.3, 215.3, 214.5, 218.1, 224.9, 229.6,
  232.96, 236.74, 237.02, 240.01, 245.12, 251.11, 255.66, 258.81, 270.97,
  292.66, 305.36, 318.13, 324.49, 330.99,
] as const;

const CPI_BASE_YEAR = 2024;
const CPI_BASE_INDEX = (() => {
  const idx = labels.indexOf(CPI_BASE_YEAR);
  return idx === -1 ? labels.length - 1 : idx;
})();

type DollarMode = "nominal" | "real";

function adjustSeriesForInflation(series: readonly number[], baseIndex = CPI_BASE_INDEX) {
  const base = cpiIndex[baseIndex];
  return series.map((value, idx) => {
    const yearCpi = cpiIndex[idx];
    if (!isFiniteNumber(value) || !isFiniteNumber(yearCpi) || !isFiniteNumber(base)) {
      return NaN;
    }
    const multiplier = base / yearCpi;
    return Number.isFinite(multiplier) ? +(value * multiplier).toFixed(2) : NaN;
  });
}

const hungerUSD = [
  212.06, 242.09, 338.84, 386.16, 410.92, 444.4, 594.08, 478.3, 545.66, 559.69,
  508.45, 563.44, 505.12, 535.1, 490.99, 417.82, 428.17, 376.13, 372.41, 359.84,
  315.75, 470.95, 495.68, 627.79, 700.7,
] as const;

const hungerOverMinwage = [
  1.88, 1.77, 1.49, 1.49, 1.46, 1.5, 1.38, 1.35, 1.36, 1.32, 1.3, 1.25, 1.23,
  1.26, 1.11, 1.05, 1.0, 0.99, 0.95, 0.94, 1.0, 1.04, 0.89, 1.0, 30126 / 28075,
] as const;

const minWageUSD = hungerUSD.map((v, i, arr) => {
  if (i === arr.length - 1) return 653;
  const derived = v / hungerOverMinwage[i];
  return isFiniteNumber(derived) ? +derived.toFixed(2) : NaN;
});

const ratio = hungerUSD.map((h, i) => {
  const a = minWageUSD[i];
  const r = h / a;
  return isFiniteNumber(r) ? +r.toFixed(3) : NaN;
});

const hungerUSDReal = adjustSeriesForInflation(hungerUSD);
const minWageUSDReal = adjustSeriesForInflation(minWageUSD);

export default function HungerMinWageUsdChart() {
  const [dollarMode, setDollarMode] = useState<DollarMode>("nominal");
  const isRealMode = dollarMode === "real";
  const hungerSeries = isRealMode ? hungerUSDReal : hungerUSD;
  const minWageSeries = isRealMode ? minWageUSDReal : minWageUSD;
  const currencySuffix = isRealMode ? `${CPI_BASE_YEAR} $` : "$";
  const axisCurrencyLabel = isRealMode ? `USD (${CPI_BASE_YEAR} $)` : "USD ($)";
  const headingMode = isRealMode ? `Reel USD (${CPI_BASE_YEAR})` : "Nominal USD";
  const ratioLine = `Oran çizgisi sağ eksendedir (Açlık/Asgari). 2026 oran ≈ ${(30126 / 28075).toFixed(2)}.`;
  const modeLine = isRealMode
    ? `Seriler ${CPI_BASE_YEAR} yılı ABD CPI ortalamasına göre enflasyondan arındırılmıştır.`
    : "Seriler cari USD cinsindendir.";
  const modeOptions: Array<{ mode: DollarMode; label: string }> = [
    { mode: "nominal", label: "Nominal USD" },
    { mode: "real", label: `Reel USD (${CPI_BASE_YEAR})` },
  ];
  const handleModeSelect = (mode: DollarMode) => {
    if (mode !== dollarMode) setDollarMode(mode);
  };

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

  const tooltipLabel = useCallback(
    (ctx: TooltipItem<"line">) => {
      const y = ctx.parsed.y; // number | null
      if (y === null || !Number.isFinite(y)) return ` ${ctx.dataset.label}: —`;
      const isRatioSeries = ctx.dataset.yAxisID === "yRatio";
      return isRatioSeries
        ? ` ${ctx.dataset.label}: ${ratioFmt.format(y)}`
        : ` ${ctx.dataset.label}: ${usd.format(y)}`;
    },
    [ratioFmt, usd]
  );

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: `Açlık Sınırı (${currencySuffix})`,
          data: hungerSeries,
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 2,
          pointHoverRadius: 6,
          yAxisID: "yUSD",
          fill: true,
          // explicitly set a readable stroke too (helps accessibility)
          borderColor: "rgba(99, 102, 241, 0.95)",
          pointBackgroundColor: "rgba(99, 102, 241, 0.95)",
          backgroundColor: (ctx: ScriptableContext<"line">) => {
            const chartArea = ctx.chart?.chartArea;
            if (!chartArea) return "rgba(99, 102, 241, 0.15)";
            const g = ctx.chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, "rgba(99, 102, 241, 0.35)");
            g.addColorStop(1, "rgba(99, 102, 241, 0.02)");
            return g;
          },
        },
        {
          label: `Asgari Ücret (${currencySuffix})`,
          data: minWageSeries,
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 2,
          pointHoverRadius: 6,
          yAxisID: "yUSD",
          fill: true,
          borderColor: "rgba(34, 197, 94, 0.95)",
          pointBackgroundColor: "rgba(34, 197, 94, 0.95)",
          backgroundColor: (ctx: ScriptableContext<"line">) => {
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
    [currencySuffix, hungerSeries, minWageSeries]
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
          onClick: (_, legendItem: LegendItem, legend) => {
            const chart = legend.chart;
            const datasets = chart.data.datasets;
            const clickedIndex = legendItem.datasetIndex;
            if (clickedIndex === undefined) return;

            // Count visible datasets
            const visibleCount = datasets.filter(
              (_, i) => chart.isDatasetVisible(i)
            ).length;

            // If this is the last visible dataset, don't hide it
            if (visibleCount === 1 && chart.isDatasetVisible(clickedIndex)) {
              return;
            }

            // Toggle visibility
            chart.setDatasetVisibility(
              clickedIndex,
              !chart.isDatasetVisible(clickedIndex)
            );
            chart.update();
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
            text: axisCurrencyLabel,
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
    [usd, ratioFmt, axisCurrencyLabel, tooltipLabel]
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
            Türkiye — Açlık Sınırı vs Asgari Ücret ({headingMode}) + Oran
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
            {ratioLine} {modeLine}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
            Kaynak:
            <a
              href="https://www.bilbilgilen.com/Turkiye/yillara-gore-yoksulluk-siniri-dolar-karsiliklari-ile.html"
              style={{ color: "rgba(99,102,241,0.9)", marginLeft: 4 }}
              rel="noreferrer"
              target="_blank"
            >
              bilbilgilen.com
            </a>
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            {modeOptions.map(({ mode, label }) => {
              const isActive = mode === dollarMode;
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleModeSelect(mode)}
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${
                      isActive ? "rgba(99,102,241,0.85)" : "rgba(255,255,255,0.25)"
                    }`,
                    background: isActive ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)",
                    color: isActive ? "white" : "rgba(255,255,255,0.8)",
                    padding: "6px 16px",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ height: 520, padding: "0 16px 16px" }}>
          <Line data={data} options={options} />
        </div>
      </div>
    </section>
  );
}

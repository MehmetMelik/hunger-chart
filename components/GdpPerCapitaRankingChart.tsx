"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
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

const labels = [
  2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014,
  2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024,
];

// Turkey's GDP per capita world ranking - Nominal (World Bank data via StatisticsTimes.com)
const nominalRanking = [
  91, 83, 77, 77, 79, 78, 76, 81, 80, 81, 84, 81, 84, 81, 81, 83, 93, 96, 90,
  92, 92, 87, 83,
] as const;

// Turkey's GDP per capita world ranking - PPP (World Bank data via StatisticsTimes.com)
const pppRanking = [
  81, 81, 79, 77, 75, 75, 76, 78, 76, 72, 71, 67, 67, 62, 63, 63, 66, 67, 61,
  62, 60, 59, 59,
] as const;

// Turkey's GDP per capita as % of World - Nominal (World Bank data via StatisticsTimes.com)
const nominalPercentWorld = [
  64.9, 76.0, 87.8, 101, 102, 113, 116, 103, 112, 108, 111, 118, 112, 109, 108,
  100, 85.6, 82.6, 80.4, 80.6, 85.2, 101, 117,
] as const;

// Turkey's GDP per capita as % of World - PPP (World Bank data via StatisticsTimes.com)
const pppPercentWorld = [
  106, 105, 112, 116, 123, 127, 131, 126, 135, 144, 146, 153, 160, 169, 170,
  173, 166, 160, 163, 162, 182, 186, 185,
] as const;

type RankingMode = "nominal" | "ppp";

export default function GdpPerCapitaRankingChart() {
  const [rankingMode, setRankingMode] = useState<RankingMode>("nominal");
  const chartRef = useRef<ChartJS<"line">>(null);

  const handleDownload = () => {
    const chart = chartRef.current;
    if (!chart) return;

    // Create a new canvas with solid background
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = chart.canvas.width;
    canvas.height = chart.canvas.height;

    // Fill with dark background color
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the chart on top
    ctx.drawImage(chart.canvas, 0, 0);

    const url = canvas.toDataURL("image/png", 1);
    const link = document.createElement("a");
    link.download = `turkey-gdp-ranking-${rankingMode}.png`;
    link.href = url;
    link.click();
  };

  const isPppMode = rankingMode === "ppp";

  const rankingSeries = isPppMode ? pppRanking : nominalRanking;
  const percentSeries = isPppMode ? pppPercentWorld : nominalPercentWorld;

  const headingMode = isPppMode ? "SGP (PPP)" : "Nominal";

  const modeOptions: Array<{ mode: RankingMode; label: string }> = [
    { mode: "nominal", label: "Nominal" },
    { mode: "ppp", label: "SGP (PPP)" },
  ];

  const handleModeSelect = (mode: RankingMode) => {
    if (mode !== rankingMode) setRankingMode(mode);
  };

  const rankFmt = useMemo(
    () => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }),
    []
  );

  const percentFmt = useMemo(
    () => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }),
    []
  );

  const tooltipLabel = useCallback(
    (ctx: TooltipItem<"line">) => {
      const y = ctx.parsed.y;
      if (y === null || !Number.isFinite(y)) return ` ${ctx.dataset.label}: —`;
      const isPercentSeries = ctx.dataset.yAxisID === "yPercent";
      return isPercentSeries
        ? ` ${ctx.dataset.label}: ${percentFmt.format(y)}%`
        : ` ${ctx.dataset.label}: ${rankFmt.format(y)}`;
    },
    [rankFmt, percentFmt]
  );

  const data: ChartData<"line", number[], number> = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: `Dunya Siralamasi (${headingMode})`,
          data: [...rankingSeries] as number[],
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
          fill: true,
          yAxisID: "yRanking",
          borderColor: isPppMode
            ? "rgba(168, 85, 247, 0.95)" // purple for PPP
            : "rgba(6, 182, 212, 0.95)", // cyan for nominal
          pointBackgroundColor: isPppMode
            ? "rgba(168, 85, 247, 0.95)"
            : "rgba(6, 182, 212, 0.95)",
          backgroundColor: (ctx: ScriptableContext<"line">) => {
            const chartArea = ctx.chart?.chartArea;
            const color = isPppMode ? "168, 85, 247" : "6, 182, 212";
            if (!chartArea) return `rgba(${color}, 0.15)`;
            const g = ctx.chart.ctx.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom
            );
            // Reversed gradient for ranking (lower values at top due to reverse axis)
            g.addColorStop(0, `rgba(${color}, 0.02)`);
            g.addColorStop(1, `rgba(${color}, 0.35)`);
            return g;
          },
        },
        {
          label: `Dunya % (${headingMode})`,
          data: [...percentSeries] as number[],
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: false,
          yAxisID: "yPercent",
          borderColor: "rgba(245, 158, 11, 0.95)", // amber
          pointBackgroundColor: "rgba(245, 158, 11, 0.95)",
          borderDash: [6, 4],
        },
      ],
    }),
    [headingMode, rankingSeries, percentSeries, isPppMode]
  );

  // Calculate dynamic Y-axis ranges
  const minRank = Math.min(...rankingSeries);
  const maxRank = Math.max(...rankingSeries);
  const minPercent = Math.min(...percentSeries);
  const maxPercent = Math.max(...percentSeries);

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
          ticks: {
            color: "rgba(255,255,255,0.70)",
            maxRotation: 0,
            autoSkip: true,
          },
        },
        yRanking: {
          type: "linear",
          position: "left",
          reverse: true, // Lower rank number = better = higher on chart
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: {
            color: "rgba(255,255,255,0.70)",
            callback: (v) => {
              const n = typeof v === "string" ? Number(v) : Number(v);
              return Number.isFinite(n) ? rankFmt.format(n) : "";
            },
          },
          title: {
            display: true,
            text: "Siralama (Dusuk = Daha Iyi)",
            color: "rgba(255,255,255,0.70)",
          },
          suggestedMin: minRank - 5,
          suggestedMax: maxRank + 5,
        },
        yPercent: {
          type: "linear",
          position: "right",
          grid: { drawOnChartArea: false },
          ticks: {
            color: "rgba(255,255,255,0.70)",
            callback: (v) => {
              const n = typeof v === "string" ? Number(v) : Number(v);
              return Number.isFinite(n) ? `${percentFmt.format(n)}%` : "";
            },
          },
          title: {
            display: true,
            text: "Dunya Ortalamasi %",
            color: "rgba(255,255,255,0.70)",
          },
          suggestedMin: Math.max(0, minPercent - 20),
          suggestedMax: maxPercent + 20,
        },
      },
    }),
    [rankFmt, percentFmt, tooltipLabel, minRank, maxRank, minPercent, maxPercent]
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
          <h2
            style={{ margin: 0, fontSize: 18, color: "rgba(255,255,255,0.92)" }}
          >
            Turkiye - Kisi Basi GSYiH ({headingMode}, 2002-2024)
          </h2>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 12,
              color: "rgba(255,255,255,0.65)",
            }}
          >
            Siralama sol eksende (ters cevirilmis), Dunya % sag eksende. 100% = Dunya ortalamasi.
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12,
              color: "rgba(255,255,255,0.65)",
            }}
          >
            Kaynak:
            <a
              href="https://statisticstimes.com/economy/country/turkey-gdp-per-capita.php"
              style={{ color: "rgba(6,182,212,0.9)", marginLeft: 4 }}
              rel="noreferrer"
              target="_blank"
            >
              StatisticsTimes.com (World Bank)
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
              const isActive = mode === rankingMode;
              const activeColor =
                mode === "ppp" ? "168, 85, 247" : "6, 182, 212";
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleModeSelect(mode)}
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${
                      isActive
                        ? `rgba(${activeColor}, 0.85)`
                        : "rgba(255,255,255,0.25)"
                    }`,
                    background: isActive
                      ? `rgba(${activeColor}, 0.25)`
                      : "rgba(255,255,255,0.05)",
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
          <Line ref={chartRef} data={data} options={options} />
        </div>

        <div style={{ padding: "0 20px 20px", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={handleDownload}
            style={{
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.20)",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.8)",
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            PNG Indir
          </button>
        </div>
      </div>
    </section>
  );
}

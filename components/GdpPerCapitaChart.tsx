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

// Turkey's GDP per capita - Nominal Current ($) (World Bank data via StatisticsTimes.com)
const nominalCurrent = [
  3591, 4650, 5980, 7332, 7990, 9767, 10913, 9077, 10699, 11374, 11777, 12636,
  12209, 11065, 10984, 10756, 9684, 9395, 8798, 9982, 10898, 13375, 15893,
] as const;

// Turkey's GDP per capita - Nominal Constant ($) (World Bank data via StatisticsTimes.com)
const nominalConstant = [
  6212, 6496, 7062, 7623, 8079, 8478, 8448, 7925, 8473, 9266, 9588, 10269,
  10598, 11065, 11280, 12006, 12255, 12238, 12339, 13671, 14274, 14933, 15395,
] as const;

// Turkey's GDP per capita - PPP Current (Int.$) (World Bank data via StatisticsTimes.com)
const pppCurrent = [
  9154, 9475, 10761, 11803, 13558, 14952, 16142, 15552, 17468, 19717, 20739,
  22475, 24193, 25897, 26731, 28354, 28640, 29016, 29209, 32106, 39919, 43196,
  45123,
] as const;

// Turkey's GDP per capita - PPP Constant (Int.$) (World Bank data via StatisticsTimes.com)
const pppConstant = [
  14588, 15256, 16584, 17903, 18972, 19909, 19840, 18612, 19897, 21760, 22518,
  24117, 24889, 25985, 26490, 28195, 28780, 28741, 28977, 32106, 33521, 35069,
  36154,
] as const;

type GdpMode = "nominal" | "ppp";

export default function GdpPerCapitaChart() {
  const [gdpMode, setGdpMode] = useState<GdpMode>("nominal");

  const isPppMode = gdpMode === "ppp";

  const currentSeries = isPppMode ? pppCurrent : nominalCurrent;
  const constantSeries = isPppMode ? pppConstant : nominalConstant;

  const headingMode = isPppMode ? "SGP (PPP)" : "Nominal";
  const currencyLabel = isPppMode ? "Int. $" : "$";
  const constantBaseYear = isPppMode ? 2021 : 2015;

  const modeOptions: Array<{ mode: GdpMode; label: string }> = [
    { mode: "nominal", label: "Nominal" },
    { mode: "ppp", label: "SGP (PPP)" },
  ];

  const handleModeSelect = (mode: GdpMode) => {
    if (mode !== gdpMode) setGdpMode(mode);
  };

  const usdFmt = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    []
  );

  const tooltipLabel = useCallback(
    (ctx: TooltipItem<"line">) => {
      const y = ctx.parsed.y;
      if (y === null || !Number.isFinite(y)) return ` ${ctx.dataset.label}: —`;
      return ` ${ctx.dataset.label}: ${usdFmt.format(y)}`;
    },
    [usdFmt]
  );

  const data: ChartData<"line", number[], number> = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: `Current (${currencyLabel})`,
          data: [...currentSeries] as number[],
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
          fill: true,
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
            g.addColorStop(0, `rgba(${color}, 0.35)`);
            g.addColorStop(1, `rgba(${color}, 0.02)`);
            return g;
          },
        },
        {
          label: `Constant (${currencyLabel})`,
          data: [...constantSeries] as number[],
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
          fill: true,
          borderColor: "rgba(34, 197, 94, 0.95)", // green
          pointBackgroundColor: "rgba(34, 197, 94, 0.95)",
          backgroundColor: (ctx: ScriptableContext<"line">) => {
            const chartArea = ctx.chart?.chartArea;
            if (!chartArea) return "rgba(34, 197, 94, 0.15)";
            const g = ctx.chart.ctx.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom
            );
            g.addColorStop(0, "rgba(34, 197, 94, 0.28)");
            g.addColorStop(1, "rgba(34, 197, 94, 0.02)");
            return g;
          },
        },
      ],
    }),
    [currencyLabel, currentSeries, constantSeries, isPppMode]
  );

  // Calculate dynamic Y-axis range
  const allValues = [...currentSeries, ...constantSeries];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);

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
        y: {
          type: "linear",
          position: "left",
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: {
            color: "rgba(255,255,255,0.70)",
            callback: (v) => {
              const n = typeof v === "string" ? Number(v) : Number(v);
              return Number.isFinite(n) ? usdFmt.format(n) : "";
            },
          },
          title: {
            display: true,
            text: `Kisi Basi GSYiH (${currencyLabel})`,
            color: "rgba(255,255,255,0.70)",
          },
          suggestedMin: Math.max(0, minVal - 2000),
          suggestedMax: maxVal + 2000,
        },
      },
    }),
    [usdFmt, tooltipLabel, currencyLabel, minVal, maxVal]
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
            Current: Cari fiyatlarla. Constant: Sabit fiyatlarla ({constantBaseYear} baz yili).
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
              const isActive = mode === gdpMode;
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
          <Line data={data} options={options} />
        </div>
      </div>
    </section>
  );
}

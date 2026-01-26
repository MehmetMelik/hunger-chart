"use client";

import Link from "next/link";

const pages = [
  {
    href: "/aclik-siniri",
    title: "Aclik Siniri vs Asgari Ucret",
    description: "Turkiye'nin aclik siniri ve asgari ucret karsilastirmasi (USD cinsinden)",
  },
  {
    href: "/gdp-per-capita",
    title: "Kisi Basi GSYiH",
    description: "Turkiye'nin kisi basi GSYiH degerleri (Nominal ve PPP, Current ve Constant)",
  },
  {
    href: "/gdp-ranking",
    title: "Kisi Basi GSYiH Siralamasi",
    description: "Turkiye'nin kisi basi GSYiH dunya siralamasi ve dunya ortalamasina orani",
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 700px at 20% 0%, #182a4a 0%, #0b1220 55%, #070b12 100%)",
        padding: "40px 16px",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "rgba(255,255,255,0.95)",
            marginBottom: 8,
          }}
        >
          Turkiye Ekonomik Gostergeler
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.65)",
            marginBottom: 32,
          }}
        >
          Turkiye ekonomisine ait cesitli gostergelerin gorsel analizi
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              style={{
                display: "block",
                padding: 24,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.10)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.5)";
                e.currentTarget.style.background =
                  "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                e.currentTarget.style.background =
                  "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))";
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.92)",
                  marginBottom: 8,
                }}
              >
                {page.title}
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.60)",
                  margin: 0,
                }}
              >
                {page.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

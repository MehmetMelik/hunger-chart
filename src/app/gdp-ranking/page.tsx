import GdpPerCapitaRankingChart from "@/../components/GdpPerCapitaRankingChart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Turkiye Kisi Basi GSYiH Dunya Siralamasi",
  description:
    "Turkiye'nin 2000-2024 yillari arasinda kisi basi GSYiH dunya siralamasinin gorsellestirmesi.",
};

export default function GdpRankingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 700px at 20% 0%, #182a4a 0%, #0b1220 55%, #070b12 100%)",
      }}
    >
      <GdpPerCapitaRankingChart />
    </main>
  );
}

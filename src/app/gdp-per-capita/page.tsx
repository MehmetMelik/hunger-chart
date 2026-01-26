import GdpPerCapitaChart from "@/../components/GdpPerCapitaChart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Turkiye Kisi Basi GSYiH",
  description:
    "Turkiye'nin 2002-2024 yillari arasinda kisi basi GSYiH (Nominal ve PPP) gorsellestirmesi.",
};

export default function GdpPerCapitaPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 700px at 20% 0%, #182a4a 0%, #0b1220 55%, #070b12 100%)",
      }}
    >
      <GdpPerCapitaChart />
    </main>
  );
}

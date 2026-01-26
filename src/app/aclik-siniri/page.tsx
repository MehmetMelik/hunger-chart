import HungerMinWageUsdChart from "@/../components/HungerMinWageUsdChart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Turkiye Aclik Siniri vs Asgari Ucret",
  description:
    "Turkiye'nin aclik siniri ve asgari ucret karsilastirmasi (USD).",
};

export default function AclikSiniriPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 700px at 20% 0%, #182a4a 0%, #0b1220 55%, #070b12 100%)",
      }}
    >
      <HungerMinWageUsdChart />
    </main>
  );
}

import HungerMinWageUsdChart from "@/../components/HungerMinWageUsdChart";

export default function Page() {
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

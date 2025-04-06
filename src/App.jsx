import React from "react";
import IntroSection from "./components/IntroSection";
import FlowerSection from "./components/GalaxyCanvas";
import ResultSection from "./components/ResultSection";
import SummarySection from "./components/SummarySection";

function App() {
  return (
    <div className="scroll-smooth font-sans bg-black text-white">
      <IntroSection />
      <FlowerSection />
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <ResultSection key={i} sectionId={i} />
      ))}
      <SummarySection />
    </div>
  );
}

export default App;

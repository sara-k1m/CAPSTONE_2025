import React from "react";
import GalaxyCanvas from "./GalaxyCanvas";

const GalaxyView = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-black">
      <GalaxyCanvas />
      <p className="text-white mt-6 text-lg text-center">
        당신의 시선이 만든 감정의 우주입니다.
      </p>
    </section>
  );
};

export default GalaxyView;

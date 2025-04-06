import React from "react";
import GazeHeatmap from "./GazeHeatmap";
import gazeData from "../data/gazeData.json";

// 📖 자동 해석 문장 생성 함수
function generateInsight(sectionId) {
  const data = gazeData.find((d) => d.section === sectionId);
  if (!data || !data.points.length) return "시선 데이터가 부족하여 분석할 수 없습니다.";

  const total = data.points.length;

  // 중심점 기준 거리 평균 계산
  const centerX = 1280 / 2;
  const centerY = 720 / 2;
  const avgDistance = data.points.reduce((sum, p) => {
    const dx = p.x - centerX;
    const dy = p.y - centerY;
    return sum + Math.sqrt(dx * dx + dy * dy);
  }, 0) / total;

  // 해석 기준 분기
  if (total > 20 && avgDistance < 150) {
    return "이 구간에서 사용자는 강하게 몰입하며 콘텐츠 중심에 집중했습니다.";
  } else if (total > 10 && avgDistance > 250) {
    return "사용자는 다양한 요소를 탐색하며 주변에 시선을 분산시켰습니다.";
  } else if (total <= 5) {
    return "짧은 시간만 주목했으며, 관심이 낮았을 가능성이 있습니다.";
  } else {
    return "사용자는 비교적 고르게 콘텐츠를 따라가며 시선을 유지했습니다.";
  }
}

// 📄 결과 섹션 컴포넌트
const ResultSection = ({ sectionId }) => {
  return (
    <section className="min-h-screen px-10 py-20 border-t bg-black">
      <h2 className="text-2xl font-semibold text-white mb-6 text-center">
        구간 {sectionId}
      </h2>
      <div className="flex gap-8">
        <div className="w-1/2 flex items-center justify-center">
          <GazeHeatmap sectionId={sectionId} width={400} height={225} />
        </div>
        <div className="w-1/2 text-white text-lg leading-relaxed">
          <p>{generateInsight(sectionId)}</p>
        </div>
      </div>
    </section>
  );
};

export default ResultSection;

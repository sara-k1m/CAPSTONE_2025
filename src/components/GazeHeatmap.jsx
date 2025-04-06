import React from "react";
import gazeData from "../data/gazeData.json";

// 🎨 감성 색상 팔레트 (보라핑크파랑 계열)
const sectionColors = [
  "rgba(153, 102, 255, 0.9)",  // 연보라
  "rgba(186, 85, 211, 0.9)",   // 보랏빛 라벤더
  "rgba(238, 130, 238, 0.9)",  // 연핑크 퍼플 (violet)
  "rgba(255, 105, 180, 0.9)",  // 핫핑크
  "rgba(135, 206, 250, 0.9)",  // 연하늘
  "rgba(100, 149, 237, 0.9)",  // 코니플라워 블루
  "rgba(54, 162, 235, 0.9)"    // 기본 블루
];

const randomColor = () =>
  sectionColors[Math.floor(Math.random() * sectionColors.length)];

// 거리 기반 가까운 점 묶기
const isClose = (p1, p2, threshold = 30) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy) < threshold;
};

// 클러스터링 (단순 평균 + 근접 거리 기반)
const clusterPoints = (points, threshold = 100) => {
  const clusters = [];

  points.forEach((point) => {
    const match = clusters.find((cluster) =>
      cluster.points.some((p) => isClose(p, point, threshold))
    );

    if (match) {
      match.points.push(point);
    } else {
      clusters.push({ points: [point] });
    }
  });


  return clusters.map((cluster) => {
    const sum = cluster.points.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
      { x: 0, y: 0 }
    );
    const count = cluster.points.length;
    return {
      x: sum.x / count,
      y: sum.y / count,
      count,
      color: randomColor(),
    };
  });
};

const GazeHeatmap = ({
  sectionId,
  width = 300,
  height = 180,
  backgroundImage = "./src/image.png", // ✅ 배경 이미지 경로
}) => {
  const data = gazeData.find((d) => d.section === sectionId);
  const scaleX = width / 1280;
  const scaleY = height / 720;

  if (!data) return null;

  const clusters = clusterPoints(data.points);

  return (
    <div
      className="relative"
      style={{
        width,
        height,
      }}
    >
      {/* 배경 이미지 */}
      <img
        src={backgroundImage}
        alt="배경"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 1,
          opacity: 0.6,
        }}
      />

      {/* 히트맵 레이어 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
          overflow: "visible",
        }}
      >
        {clusters.map((c, idx) => {
          const x = c.x * scaleX;
          const y = c.y * scaleY;
          const baseSize = 10;
          const radius = baseSize + Math.sqrt(c.count) * 30;

          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                left: x - radius / 2,
                top: y - radius / 2,
                width: radius,
                height: radius,
                borderRadius: "50%",
                backgroundColor: c.color,
                //boxShadow: `0 0 18px 6px rgba(255, 255, 255, 0.6)`, // ✅ 흰색 glow
                opacity: 0.4,
                pointerEvents: "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GazeHeatmap;

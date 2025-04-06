import React, { useEffect, useRef } from "react";
import gazeData from "../data/gazeData.json";

const sectionColors = [
  "rgba(255, 99, 132, 0.6)",
  "rgba(255, 159, 64, 0.6)",
  "rgba(255, 205, 86, 0.6)",
  "rgba(75, 192, 192, 0.6)",
  "rgba(54, 162, 235, 0.6)",
  "rgba(153, 102, 255, 0.6)"
];

const GalaxyCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width = 800;
    const height = canvas.height = 800;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // 배경 그라디언트
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width / 1.5);
    gradient.addColorStop(0, "#0a0a0a");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 시선 데이터 기반 시각화
    gazeData.forEach((section, idx) => {
      const color = sectionColors[idx % sectionColors.length];
      const angleBase = (Math.PI * 2) / 6 * idx;
      const sectionPoints = [];

      section.points.forEach((point, i) => {
        const angle = angleBase + i * 0.1;
        const distance = 80 + Math.random() * 180;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        const radius = 10 + Math.random() * 6;

        sectionPoints.push({ x, y }); // 👉 위치 저장

        // 별 그리기
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fill();
      });

      // ⭐ 별자리 선 연결
      if (sectionPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(sectionPoints[0].x, sectionPoints[0].y);
        for (let i = 1; i < sectionPoints.length; i++) {
          ctx.lineTo(sectionPoints[i].x, sectionPoints[i].y);
        }
        ctx.strokeStyle = color.replace("0.6", "0.4");
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.stroke();
      }
    });
  }, []);

  return <canvas ref={canvasRef} width={800} height={800} className="mx-auto mt-10 rounded-xl shadow-xl" />;
};

export default GalaxyCanvas;

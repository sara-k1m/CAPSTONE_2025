import React, { useEffect, useRef } from "react";
import gazeData from "../data/gazeData.json";

const FlowerCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width = 600;
    const height = canvas.height = 600;

    const centerX = width / 2;
    const centerY = height / 2;

    // 🌈 섹션별 색상 정의
    const sectionColors = [
      "rgba(255, 99, 132, 0.4)",   // Red
      "rgba(255, 159, 64, 0.4)",   // Orange
      "rgba(255, 205, 86, 0.4)",   // Yellow
      "rgba(75, 192, 192, 0.4)",   // Teal
      "rgba(54, 162, 235, 0.4)",   // Blue
      "rgba(153, 102, 255, 0.4)",  // Purple
    ];

    // 🌼 시선 포인트를 하나의 flat 배열로 정리
    const petals = [];
    gazeData.forEach((section, idx) => {
      const angleOffset = (Math.PI * 2 / 6) * idx;
      const color = sectionColors[idx % sectionColors.length];

      section.points.forEach((point, i) => {
        const angle = angleOffset + (i * 0.1);
        const dist = 80 + Math.random() * 100;

        const petalX = centerX + Math.cos(angle) * dist;
        const petalY = centerY + Math.sin(angle) * dist;

        petals.push({ x1: centerX, y1: centerY, x2: petalX, y2: petalY, color });
      });
    });

    // 🎥 하나씩 그리는 애니메이션
    let frame = 0;

    function animate() {
      if (frame >= petals.length) return;

      const { x1, y1, x2, y2, color } = petals[frame];
      drawPetal(ctx, x1, y1, x2, y2, color);
      frame++;
      requestAnimationFrame(animate);
    }

    function drawPetal(ctx, x1, y1, x2, y2, color) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo((x1 + x2) / 2 + 20, (y1 + y2) / 2 - 20, x2, y2);
      ctx.quadraticCurveTo((x1 + x2) / 2 - 20, (y1 + y2) / 2 + 20, x1, y1);
      ctx.fillStyle = color;
      ctx.fill();
    }

    // 초기 캔버스 클리어 후 애니메이션 시작
    ctx.clearRect(0, 0, width, height);
    animate();

  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      className="rounded-xl shadow-xl"
    />
  );
};

export default FlowerCanvas;

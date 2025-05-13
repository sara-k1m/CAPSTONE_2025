let scene = null;

// Scene별 시선 데이터 저장
let scene1GazeData = [];
let scene2GazeData = [];
let scene3GazeData = [];
let scene4GazeData = [];
let scene5GazeData = [];
let scene6GazeData = [];

// 영상 시간에 따라 scene 판별
const sceneTimeline = [
  { start: 0, end: 15, scene: 1 },
  { start: 15, end: 52, scene: 2 },
  { start: 52, end: 62, scene: 3 },
  { start: 62, end: 75, scene: 4 },
  { start: 75, end: 85, scene: 5 },
  { start: 85, end: 96, scene: 6 }
];

export function updateSceneFromTime(currentTime) {
  const found = sceneTimeline.find(s => currentTime >= s.start && currentTime < s.end);
  scene = found ? found.scene : null;
}

// Scene 3, 4 클러스터 정의
const scene3NamedClusters = [
  { label: "red", x: 20, y: 400 },
  { label: "yellow", x: 400, y: 400 },
  { label: "white", x: 900, y: 400 },
  { label: "blue", x: 1350, y: 400 }
];

const scene4NamedClusters = [
  { label: "curiosity", x: 300, y: 200 },
  { label: "calm", x: 500, y: 150 },
  { label: "romance", x: 700, y: 180 },
  { label: "joy", x: 800, y: 400 },
  { label: "intuition", x: 600, y: 500 },
  { label: "clarity", x: 400, y: 450 }
];

// 시선 기록
export function recordGaze(gazeInfo) {
  const point = { x: gazeInfo.x, y: gazeInfo.y };
  switch (scene) {
    case 1: scene1GazeData.push(point); break;
    case 2: scene2GazeData.push(point); break;
    case 3: scene3GazeData.push(point); break;
    case 4: scene4GazeData.push(point); break;
    case 5: scene5GazeData.push(point); break;
    case 6: scene6GazeData.push(point); break;
  }
}

// 수집된 시선 데이터 가져오기
export function getCollectedGazeData() {
  return {
    scene1: scene1GazeData,
    scene2: scene2GazeData,
    scene3: scene3GazeData,
    scene4: scene4GazeData,
    scene5: scene5GazeData,
    scene6: scene6GazeData
  };
}

// 시선 시각화
export function showGaze(gazeInfo) {
  const canvas = document.getElementById("output");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#00FF00";
  ctx.beginPath();
  ctx.arc(gazeInfo.x, gazeInfo.y, 10, 0, Math.PI * 2);
  ctx.fill();

  recordGaze(gazeInfo);
}

// 시선 시각화 제거
export function hideGaze() {
  const canvas = document.getElementById("output");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// scene 3, 4 분석
function getMostVotedLabel(points, referenceList) {
  const labelCount = {};
  for (const point of points) {
    let minDist = Infinity;
    let closestLabel = null;
    for (const ref of referenceList) {
      const dx = point.x - ref.x;
      const dy = point.y - ref.y;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        closestLabel = ref.label;
      }
    }
    if (closestLabel) {
      labelCount[closestLabel] = (labelCount[closestLabel] || 0) + 1;
    }
  }
  const sorted = Object.entries(labelCount).sort((a, b) => b[1] - a[1]);
  return sorted.map(([label]) => label);
}

function analyzeUnifiedBehaviorType(data) {
  // Scene 1, 2, 5, 6의 시선 데이터를 통합
  const allPoints = [...data.scene1, ...data.scene2, ...data.scene5, ...data.scene6];
  
  // 유효한 좌표 (number 타입이고 NaN이 아닌 값)만 필터링
  const points = allPoints.filter(p =>
    typeof p.x === 'number' && !isNaN(p.x) &&
    typeof p.y === 'number' && !isNaN(p.y)
  );
  
  if (points.length < 2) {
    return {
      name: "Insufficient Data",
      metrics: {
        fixationTime: { raw: null, score: null },
        fixationCount: { raw: null, score: null },
        fixationDurationStd: { raw: null, score: null },
        dispersion: { raw: null, score: null },
        transitionFreq: { raw: null, score: null },
        zoneDiversity: { raw: null, score: null }
      }
    };
  }

  // 1. 인접 포인트 간 거리 계산 (adaptive threshold 산출)
  const distances = [];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const d = Math.sqrt(dx * dx + dy * dy);
    distances.push(d);
  }
  distances.sort((a, b) => a - b);
  const medianDistance = distances[Math.floor(distances.length / 2)] || 0;
  const fixationThreshold = medianDistance * 1.5; // 동적 threshold 설정

  // 2. Fixation segmentation: 인접 거리가 threshold 미만이면 한 그룹으로 묶음
  const segments = [];
  let currentSegment = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < fixationThreshold) {
      currentSegment.push(points[i]);
    } else {
      segments.push([...currentSegment]);
      currentSegment = [points[i]];
    }
  }
  if (currentSegment.length) {
    segments.push(currentSegment);
  }

  // 3. Fixation 관련 통계량
  const fixationCount = segments.length;
  const fixationDurations = segments.map(seg => seg.length);
  const avgFixationDuration = fixationDurations.reduce((sum, len) => sum + len, 0) / fixationCount;
  const fixationDurationStd = Math.sqrt(
    fixationDurations.reduce((sum, len) => sum + Math.pow(len - avgFixationDuration, 2), 0) / fixationCount
  );

  // 4. 전역적 Dispersion (공간적 분산 계산)
  const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const stdX = Math.sqrt(points.reduce((sum, p) => sum + Math.pow(p.x - meanX, 2), 0) / points.length);
  const stdY = Math.sqrt(points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0) / points.length);
  const dispersion = (stdX + stdY) / 2;

  // 5. Transition Frequency (포인트 전환 빈도)
  const transitionFreq = points.length / fixationCount;

  // 6. Zone Diversity (200×200 그리드 사용)
  const gridSize = 200;
  const zoneSet = new Set(points.map(p => {
    const gridX = Math.floor(p.x / gridSize);
    const gridY = Math.floor(p.y / gridSize);
    return `${gridX},${gridY}`;
  }));
  const zoneDiversity = zoneSet.size;

  // 7. 정규화 함수: 각 값들을 1~10 스케일로 변환
  function normalize(value, min, max) {
    return Math.max(1, Math.min(10, ((value - min) / (max - min)) * 9 + 1));
  }

  const normFixationTime = normalize(avgFixationDuration, 1, 50);
  const normFixationCount = normalize(fixationCount, 3, 150);
  const normDispersion = normalize(dispersion, 20, 500);
  const normTransitionFreq = normalize(transitionFreq, 1, 30);
  const normZoneDiversity = normalize(zoneDiversity, 1, 30);
  const normFixationDurationStd = normalize(fixationDurationStd, 0, 20);

  // 8. 사용자 프로파일 구성
  const profile = {
    fixationTime: normFixationTime,
    fixationCount: normFixationCount,
    dispersion: normDispersion,
    transitionFreq: normTransitionFreq,
    zoneDiversity: normZoneDiversity,
    fixationDurationStd: normFixationDurationStd
  };

  // 9. 유형 벡터 정의
const types = [
  { name: "통찰자", fixationTime: 10, fixationCount: 2, dispersion: 2, transitionFreq: 2, zoneDiversity: 2 },
  { name: "유영자", fixationTime: 4, fixationCount: 8, dispersion: 10, transitionFreq: 8, zoneDiversity: 10 },
  { name: "불꽃자", fixationTime: 2, fixationCount: 8, dispersion: 10, transitionFreq: 10, zoneDiversity: 8 },
  { name: "미로자", fixationTime: 6, fixationCount: 6, dispersion: 4, transitionFreq: 4, zoneDiversity: 4 },
  { name: "초점자", fixationTime: 8, fixationCount: 4, dispersion: 2, transitionFreq: 2, zoneDiversity: 2 },
  { name: "공간자", fixationTime: 2, fixationCount: 10, dispersion: 10, transitionFreq: 10, zoneDiversity: 10 },
  { name: "파편자", fixationTime: 4, fixationCount: 4, dispersion: 8, transitionFreq: 10, zoneDiversity: 8 },
  { name: "침잠자", fixationTime: 10, fixationCount: 2, dispersion: 2, transitionFreq: 2, zoneDiversity: 2 },
  { name: "교차자", fixationTime: 6, fixationCount: 6, dispersion: 4, transitionFreq: 6, zoneDiversity: 4 },
  { name: "집합자", fixationTime: 6, fixationCount: 10, dispersion: 6, transitionFreq: 6, zoneDiversity: 4 }
];

  function distance(a, b) {
    return (
      Math.pow(a.fixationTime - b.fixationTime, 2) +
      Math.pow(a.fixationCount - b.fixationCount, 2) +
      Math.pow(a.dispersion - b.dispersion, 2) +
      Math.pow(a.transitionFreq - b.transitionFreq, 2) +
      Math.pow(a.zoneDiversity - b.zoneDiversity, 2)
    );
  }
  const closest = types.reduce((prev, curr) =>
    distance(profile, curr) < distance(profile, prev) ? curr : prev
  );

  return {
    name: closest.name,
    metrics: {
      fixationTime: { raw: parseFloat(avgFixationDuration.toFixed(2)), score: profile.fixationTime },
      fixationCount: { raw: fixationCount, score: profile.fixationCount },
      fixationDurationStd: { raw: parseFloat(fixationDurationStd.toFixed(2)), score: profile.fixationDurationStd },
      dispersion: { raw: parseFloat(dispersion.toFixed(2)), score: profile.dispersion },
      transitionFreq: { raw: parseFloat(transitionFreq.toFixed(2)), score: profile.transitionFreq },
      zoneDiversity: { raw: zoneDiversity, score: profile.zoneDiversity }
    }
  };
}

// 클러스터 중심에 밀도 기반 반지름 계산
function getClusterHeatmap(points, referenceList, minR = 10, maxR = 30) {
  const clusterCount = {};
  const clusterCoords = {};

  for (const ref of referenceList) {
    clusterCount[ref.label] = 0;
    clusterCoords[ref.label] = { x: ref.x, y: ref.y };
  }

  for (const point of points) {
    let minDist = Infinity;
    let closest = null;
    for (const ref of referenceList) {
      const dx = point.x - ref.x;
      const dy = point.y - ref.y;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        closest = ref.label;
      }
    }
    if (closest) clusterCount[closest]++;
  }

  const counts = Object.values(clusterCount);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);

  const result = Object.entries(clusterCoords).map(([label, coord]) => {
    const count = clusterCount[label];
    let r = minR;
    if (maxCount > minCount) {
      r = ((count - minCount) / (maxCount - minCount)) * (maxR - minR) + minR;
    }
    return { x: coord.x, y: coord.y, r: Math.round(r) };
  });

  return result;
}

const flowerToNumber = {
  "아이리스": 1, "라넌큘러스": 2, "튤립": 3, "헬레보루스": 4, "칼라 릴리": 5,
  "수국": 6, "아네모네": 7, "블루 델피늄": 8, "프리지아": 9, "국화": 10
};

const colorToNumber = {
  "red": 0, "yellow": 1, "blue": 2, "white": 3
};

function sendFlowerResultViaOSC(resultNum) {
  fetch("http://localhost:3000/send_result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resultNum })
  }).then(res => {
    if (res.ok) {
      console.log("🌸 OSC 전송 완료:", resultNum);
    } else {
      console.error("❌ OSC 전송 실패:", res.statusText);
    }
  }).catch(err => {
    console.error("❌ 네트워크 오류:", err);
  });
}

// 전체 결과 저장
export function saveGazeDataAsJSON() {
  const data = getCollectedGazeData();

  function getRandomLabel(referenceList) {
    const randomIndex = Math.floor(Math.random() * referenceList.length);
    return referenceList[randomIndex].label;
  }

  const scene3TopColor =
    getMostVotedLabel(data.scene3, scene3NamedClusters)[0] ||
    getRandomLabel(scene3NamedClusters);

  const scene4TopKeyword =
    getMostVotedLabel(data.scene4, scene4NamedClusters)[0] ||
    getRandomLabel(scene4NamedClusters);

  // 전체 시선 분석: 사용자 유형 및 꽃 종류 결정
  const typeInfo = analyzeUnifiedBehaviorType(data);

  const typeFlowerMap = {
    "통찰자": "아이리스",
    "유영자": "라넌큘러스",
    "불꽃자": "튤립",
    "미로자": "헬레보루스",
    "초점자": "칼라 릴리",
    "공간자": "수국",
    "파편자": "아네모네",
    "침잠자": "블루 델피늄",
    "교차자": "프리지아",
    "집합자": "국화"
  };

  const flowerName = typeFlowerMap[typeInfo.name] || "알 수 없음";

  // 점수 정리
  const rawScores = typeInfo.metrics;
  const scoresOutOf10 = {};
  for (const key in rawScores) {
    if (rawScores[key].score !== null) {
      scoresOutOf10[key] = parseFloat(rawScores[key].score.toFixed(1));
    }
  }

  // 출력 구조
  const visual1 = {
    flower: flowerName,          // 사용자 전체 유형 기반 꽃 종류
    type: typeInfo.name,         // 사용자 유형
    color: scene3TopColor,       // Scene 3 기반 색상
    keyword: scene4TopKeyword,   // Scene 4 기반 내면 키워드
    scores: scoresOutOf10        // 10점 만점 점수들
  };

  const visual2 = {
    heatmap: getClusterHeatmap(data.scene3, scene3NamedClusters)
  };

  const visual3 = {
    heatmap: getClusterHeatmap(data.scene4, scene4NamedClusters)
  };

  const fullOutput = { visual1, visual2, visual3 };

  const blob = new Blob([JSON.stringify(fullOutput, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'result.json';

  // ✅ OSC 전송용 결과 번호 계산
  const flowerNum = flowerToNumber[flowerName] || 0;
  const colorOffset = colorToNumber[scene3TopColor] ?? -1;
  const resultNum = (colorOffset * 10) + flowerNum;

  // ✅ OSC로 숫자 하나 전송
  sendFlowerResultViaOSC(resultNum);

  a.click();
  URL.revokeObjectURL(url);
}

import 'regenerator-runtime/runtime';
import { showGaze, hideGaze } from "../showGaze";
import EasySeeSo from 'seeso/easy-seeso';

const licenseKey = 'dev_cmd63zid3tukasj534n3ah606tjvyhn6ego0jnzv';
let gazePointsCount = {};

const trackingPhases = [
  { start: 0, end: 5, rows: 2, cols: 3, labels: ["A", "B", "C", "D", "E", "F"], stage: "Stage1" },
  { start: 45, end: 55, rows: 5, cols: 1, labels: ["A", "B", "C", "D", "E"], stage: "Stage2" },
  { start: 60, end: 70, rows: 1, cols: 2, labels: ["A", "B"], stage: "Stage3" },
  { start: 82, end: 92, rows: 2, cols: 2, labels: ["A", "B", "C", "D"], stage: "Stage4" },
  { start: 100, end: 110, rows: 4, cols: 1, labels: ["A", "B", "C", "D"], stage: "Stage5" }
];

function getCurrentPhase(time) {
  return trackingPhases.find(phase => time >= phase.start && time <= phase.end);
}

function getPartitionTypeFromPhase(phase) {
  if (phase.rows === 2 && phase.cols === 2) return "quadrant4";
  if (phase.rows === 2 && phase.cols === 3) return "quadrant6";
  if (phase.cols === 1 && phase.rows === 4) return "vertical4";
  if (phase.cols === 2 && phase.rows === 1) return "horizontal2";
  return "quadrant4";
}

function updateGazeCount(gazeInfo, phase) {
  if (!phase) return;

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const cellWidth = screenWidth / phase.cols;
  const cellHeight = screenHeight / phase.rows;

  const col = Math.floor(gazeInfo.x / cellWidth);
  const row = Math.floor(gazeInfo.y / cellHeight);
  const index = row * phase.cols + col;

  const label = phase.labels[index];

  if (label) {
    gazePointsCount[label] = (gazePointsCount[label] || 0) + 1;
  }

  // 서버로 실시간 데이터 전송
  fetch('http://localhost:3000/send_gaze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x: gazeInfo.x, y: gazeInfo.y, label, stage: phase.stage })
  }).catch(console.error);
}

function stopTracking(seeSo) {
  seeSo.stopTracking();
  hideGaze();
}

function onGaze(gazeInfo) {
  const video = document.getElementById("background-video");
  if (!video) return;

  const time = Math.floor(video.currentTime);
  const phase = getCurrentPhase(time);

  const isActiveStage = phase !== undefined;
  const partitionType = phase ? getPartitionTypeFromPhase(phase) : "quadrant4";

  showGaze(gazeInfo, isActiveStage, partitionType);
  updateGazeCount(gazeInfo, phase);
}

async function main() {
  const seeSo = new EasySeeSo();
  await seeSo.init(
    licenseKey,
    () => {
      seeSo.startTracking(onGaze);
      setTimeout(() => stopTracking(seeSo), 110000);
    },
    () => console.log("Failed to initialize SeeSo")
  );
}

(async () => {
  await main();
})();

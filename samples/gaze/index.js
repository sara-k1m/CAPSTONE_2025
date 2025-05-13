import 'regenerator-runtime/runtime';
import EasySeeSo from "seeso/easy-seeso";
import {
  showGaze,
  hideGaze,
  updateSceneFromTime,
  saveGazeDataAsJSON
} from "./clustering.js";

const licenseKey = 'dev_3iq5dqch4m87cqwek4uxlimuxvtvgiumyuh16vjd';

let eyeTracker = null;
let video = null;
let isTracking = false;

// ✅ 시선 추적 콜백
function onGaze(gazeInfo) {
  updateSceneFromTime(video.currentTime);
  showGaze(gazeInfo);

  // 👁️ 시선 정보를 DOM에 보기 좋게 표시
  const gazeInfoDiv = document.getElementById("gazeInfo");
  if (gazeInfoDiv) {
    gazeInfoDiv.innerText = `Gaze Coordinates
x: ${gazeInfo.x}
y: ${gazeInfo.y}
`;
  }
}



// ✅ 시선 추적 시작
function startTrackingGaze() {
  if (eyeTracker && !isTracking) {
    eyeTracker.startTracking(onGaze);
    isTracking = true;
    console.log("👁️ Gaze tracking started");
  }
}

// ✅ 시선 추적 중지
function stopTrackingGaze() {
  if (eyeTracker && isTracking) {
    eyeTracker.stopTracking();
    isTracking = false;
    console.log("🛑 Gaze tracking stopped");
  }
}

// ✅ SeeSo 초기화
async function initSeeSo() {
  eyeTracker = new EasySeeSo();
  await eyeTracker.init(
    licenseKey,
    async () => {
      console.log("✅ SeeSo initialized");
      if (!eyeTracker.checkMobile()) {
        eyeTracker.setMonitorSize(14);       // 화면 크기 설정
        eyeTracker.setFaceDistance(50);      // 사용자 거리 설정
        eyeTracker.setCameraPosition(window.outerWidth / 2, true);
      }
    },
    () => {
      console.error("❌ SeeSo initialization failed");
    }
  );
}

// ✅ 영상 타이머 업데이트
function setupVideoTimer(video) {
  const timerDisplay = document.getElementById("video-timer");
  video.addEventListener("timeupdate", () => {
    const mins = String(Math.floor(video.currentTime / 60)).padStart(2, '0');
    const secs = String(Math.floor(video.currentTime % 60)).padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
  });
}

// 시작 버튼
function setupStartButton() {
  const startBtn = document.getElementById("start-button");
  const timerDisplay = document.getElementById("video-timer");
  const gazeInfo = document.getElementById("gazeInfo");

  startBtn.addEventListener("click", () => {
    startBtn.style.display = "none";

    // 숨겨진 요소 표시
    timerDisplay.classList.remove("hidden");
    gazeInfo.classList.remove("hidden");

    video.play().then(() => {
      startTrackingGaze();  // 시선 추적 시작
    }).catch(err => {
      console.error("❌ Video play error:", err);
    });
  });
}


// 키보드 단축키: 숫자키로 영상 시간 이동
function setupKeyShortcuts(video) {
  window.addEventListener("keydown", (e) => {
    const key = e.key;
    if (!/^[0-9]$/.test(key)) return;
    const duration = video.duration;
    if (!duration) return;

    let targetTime = 0;
    if (key === '0') {
      targetTime = 0;
    } else {
      const percent = parseInt(key) * 10;
      targetTime = (percent / 100) * duration;
    }

    video.currentTime = targetTime;
    console.log(`⏩ Jump to ${Math.floor(targetTime)}s (${key}0%)`);
  });
}

// 초기 상태로 UI 및 추적 리셋
function resetToStartState() {
  hideGaze();
  stopTrackingGaze();

  const startBtn = document.getElementById("start-button");
  startBtn.style.display = "block";

  // 시선 정보 & 타이머 숨기기
  document.getElementById("video-timer")?.classList.add("hidden");
  document.getElementById("gazeInfo")?.classList.add("hidden");

  video.pause();
  video.currentTime = 0;
}


// 전체 앱 초기화 및 시작
async function main() {
  video = document.getElementById("background-video");

  if (video.readyState < 2) {
    await new Promise(res => video.addEventListener("loadeddata", res, { once: true }));
  }

  await initSeeSo();
  setupVideoTimer(video);
  setupStartButton();
  setupKeyShortcuts(video);

  video.addEventListener("ended", () => {
    saveGazeDataAsJSON();  // ✅ 결과 저장
    resetToStartState();   // ✅ UI 및 추적 초기화
  });
}

// 🚀 시작
window.addEventListener("DOMContentLoaded", main);

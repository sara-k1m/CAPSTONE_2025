let gazePointsCount = []; // 다양한 분할 방식 지원
let lastUpdateTime = Date.now();

/**
 * 현재 시선 위치를 기반으로 gaze 카운트를 업데이트하는 함수
 * @param {object} gazeInfo - 시선 좌표 정보 (x, y)
 * @param {string} partitionType - 화면 분할 방식 ("quadrant4", "quadrant6", "vertical4", "horizontal2")
 */
function updateGazeCount(gazeInfo, partitionType) {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  let partitionIndex;
  let partitionNames;

  switch (partitionType) {
    case "quadrant4": // 4분할
      partitionNames = ["왼쪽 상단", "오른쪽 상단", "왼쪽 하단", "오른쪽 하단"];
      partitionIndex = (gazeInfo.x < screenWidth / 2 ? 0 : 1) + (gazeInfo.y < screenHeight / 2 ? 0 : 2);
      break;

    case "quadrant6": // 6분할 (위쪽 3개, 아래쪽 3개)
      partitionNames = ["왼쪽 상단", "가운데 상단", "오른쪽 상단", "왼쪽 하단", "가운데 하단", "오른쪽 하단"];
      let colIndex = Math.floor((gazeInfo.x / screenWidth) * 3);
      let rowIndex = gazeInfo.y < screenHeight / 2 ? 0 : 3;
      partitionIndex = colIndex + rowIndex;
      break;

    case "vertical4": // 세로 4분할
      partitionNames = ["상단 1", "상단 2", "하단 1", "하단 2"];
      partitionIndex = Math.floor((gazeInfo.y / screenHeight) * 4);
      break;

    case "horizontal2": // 좌우 2분할
      partitionNames = ["왼쪽", "오른쪽"];
      partitionIndex = gazeInfo.x < screenWidth / 2 ? 0 : 1;
      break;

    default:
      console.error("올바르지 않은 partitionType:", partitionType);
      return;
  }

  // 배열 크기 맞추기
  if (gazePointsCount.length !== partitionNames.length) {
    gazePointsCount = new Array(partitionNames.length).fill(0);
  }

  // 해당 구역 카운트 증가
  gazePointsCount[partitionIndex]++;

  // 1초마다 가장 많은 gaze point가 위치한 구역 출력
  const currentTime = Date.now();
  if (currentTime - lastUpdateTime >= 1000) {
    lastUpdateTime = currentTime;

    const maxCount = Math.max(...gazePointsCount);
    const maxIndex = gazePointsCount.indexOf(maxCount);
    
    console.log(`현재 가장 많은 gazePoint가 위치한 영역: ${partitionNames[maxIndex]}`);
    
    // 카운트 초기화
    gazePointsCount.fill(0);
  }
}

/**
 * 시선 정보를 화면에 표시하는 함수
 * @param {object} gazeInfo - 시선 좌표 정보 (x, y)
 */
function showGazeInfoOnDom(gazeInfo) {
  let gazeInfoDiv = document.getElementById("gazeInfo");
  gazeInfoDiv.innerText = `Gaze Information Below
                          \nx: ${gazeInfo.x}
                          \ny: ${gazeInfo.y}`;
}

/**
 * 시선 정보를 화면에서 숨기는 함수
 */
function hideGazeInfoOnDom() {
  let gazeInfoDiv = document.getElementById("gazeInfo");
  gazeInfoDiv.innerText = "";
}

/**
 * 시선 추적 점을 화면에 표시하는 함수 (Stage 구간 여부에 따라 색상 변경)
 * @param {object} gazeInfo - 시선 좌표 정보 (x, y)
 * @param {boolean} isActiveStage - 현재 시간이 Stage 구간인지 여부
 * @param {string} partitionType - 화면 분할 방식
 */
function showGazeDotOnDom(gazeInfo, isActiveStage, partitionType) {
  let canvas = document.getElementById("output");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let ctx = canvas.getContext("2d");

  // 원 색상 설정 (Stage 구간이면 초록색, 아니면 빨간색)
  ctx.fillStyle = isActiveStage ? "#00FF00" : "#FF0000";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(gazeInfo.x, gazeInfo.y, 10, 0, Math.PI * 2, true);
  ctx.fill();

  // Gaze count 업데이트
  updateGazeCount(gazeInfo, partitionType);
}

/**
 * 시선 추적 점을 화면에서 숨기는 함수
 */
function hideGazeDotOnDom() {
  let canvas = document.getElementById("output");
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * 시선 정보를 표시하는 메인 함수 (Stage 구간 여부 추가)
 * @param {object} gazeInfo - 시선 좌표 정보 (x, y)
 * @param {boolean} isActiveStage - 현재 시간이 Stage 구간인지 여부
 * @param {string} partitionType - 화면 분할 방식 ("quadrant4", "quadrant6", "vertical4", "horizontal2")
 */
function showGaze(gazeInfo, isActiveStage, partitionType = "quadrant4") {
  showGazeInfoOnDom(gazeInfo);
  showGazeDotOnDom(gazeInfo, isActiveStage, partitionType);
}

/**
 * 시선 정보를 숨기는 함수
 */
function hideGaze() {
  hideGazeInfoOnDom();
  hideGazeDotOnDom();
}

export { showGaze, hideGaze };

# SeeSo & TouchDesigner OSC 연동 프로젝트

이 프로젝트는 웹 브라우저에서 [SeeSo](https://sdk.eyedid.ai)를 활용하여 사용자의 시선을 실시간 추적하고, 그 데이터를 Node.js 서버를 통해 TouchDesigner와 실시간으로 연동하는 프로젝트입니다.

## 📂 프로젝트 구조

```
프로젝트 폴더
.
├── devServer.js
├── dist
├── node_modules
├── osc_server.js
├── package-lock.json
├── package.json
└── samples
    ├── gaze
    │   ├── index.html
    │   ├── index.js
    │   ├── sample.mp4
    │   └── styles.css
    └── showGaze.js
```

## 🔧 설치 방법

### 1. 프로젝트 클론 및 이동

```bash
git clone [당신의 깃허브 저장소 주소]
cd [프로젝트 폴더 이름]
```

### 2. 종속성 설치

```bash
npm install
```

## 🚀 실행 방법

### 단계 1. Node.js OSC 서버 실행

터미널에서 다음 명령어를 실행합니다:

```bash
node osc_server.js
```

정상적으로 실행되면 콘솔에 다음과 같은 메시지가 출력됩니다:

```
✅ OSC 준비 완료!
🚀 서버 실행: http://localhost:3000
```

### 단계 2. 웹 클라이언트 실행 (`samples/gaze` 폴더)

새로운 터미널 창을 열고 다음을 실행합니다:

```bash
npm run gaze
```

브라우저에서 `http://localhost:8082`로 접속하여 클라이언트를 실행합니다.

브라우저 콘솔에서 다음 메시지가 확인됩니다:

```
✅ SeeSo 초기화 완료
```

이제 시선 데이터를 실시간으로 Node.js 서버에 전송하기 시작합니다.

## 🎛️ TouchDesigner 설정

TouchDesigner에서 다음과 같이 OSC 수신을 설정합니다:

- **OSC In CHOP**을 추가하고 설정합니다:

| 항목            | 설정값                  |
|-----------------|-------------------------|
| Protocol        | UDP                     |
| Network Port    | 5005                    |
| Network Address | 127.0.0.1 (localhost)   |

이제 TouchDesigner는 시선 데이터를 `/gazePosition` 주소로 수신합니다.

## ✅ 정상 작동 확인

모든 것이 잘 설정되었다면 다음과 같은 흐름이 이루어집니다:

- 브라우저 콘솔:
  ```
  📡 데이터 전송: { x: 500, y: 320, label: 'A', stage: 'Stage1' }
  ```

- Node.js 서버 콘솔:
  ```
  📨 OSC로 보낸 데이터: { x: 500, y: 320, label: 'A', stage: 'Stage1' }
  ```

- TouchDesigner:
  ```
  OSC In CHOP에서 실시간 데이터 수신
  /gazePosition {"x":500,"y":320,"label":"A","stage":"Stage1"}
  ```

## 📌 주의사항

- 반드시 Node.js 서버를 먼저 실행한 후 웹페이지를 열어야 합니다.
- 포트 충돌이 발생하면 `osc_server.js` 파일의 포트 번호를 변경하세요.

## 📄 사용된 기술

- [SeeSo SDK](https://sdk.eyedid.ai)
- Node.js
- Express
- OSC(Open Sound Control)
- TouchDesigner


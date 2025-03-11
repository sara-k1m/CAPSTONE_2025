import express from 'express';
import osc from 'osc';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// OSC 클라이언트 설정
const oscClient = new osc.UDPPort({
  remoteAddress: "127.0.0.1",
  remotePort: 5005,
});

oscClient.open();

oscClient.on('ready', () => {
  console.log('✅ OSC 준비 완료!');
});

// 라우트로 데이터 받기
app.post('/send_gaze', (req, res) => {
  const gazeData = req.body;

  // TouchDesigner로 OSC 메시지 전송
  oscClient.send({
    address: "/gazePosition",
    args: [{ type: "s", value: JSON.stringify(gazeData) }]
  });

  console.log('📨 OSC로 보낸 데이터:', gazeData);
  res.status(200).send({ message: "Data sent successfully" });
});

app.listen(port, () => {
  console.log(`🚀 서버 실행: http://localhost:${port}`);
});

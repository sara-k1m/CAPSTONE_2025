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
  console.log('✅ OSC server ready!');
});

// POST로 {색상 번호, 꽃 번호}를 받는 라우터
app.post('/send_result', (req, res) => {
  const { resultNum } = req.body;

  // TouchDesigner로 OSC 메시지 전송
  oscClient.send({
    address: "/resultFlower",
    args: [ resultNum ]
  });

  console.log('📨 sent result: resultNum ');
  res.status(200).send({ message: "Result sent successfully" });
});

app.listen(port, () => {
  console.log(`🚀 run server: http://localhost:${port}`);
});

// 1. 필요한 모듈 불러오기 (npm install express aedes net cors mqtt)
const express = require('express');
const Aedes = require('aedes');   // aedes 모듈 불러오기
const aedes = new Aedes();        // MQTT 우체국(브로커) 모듈 생성
const net = require('net');       // MQTT용 네트워크 모듈
const cors = require('cors');     // 웹 브라우저 보안 에러 방지
const mqtt = require('mqtt');     // 서버 자신이 MQTT 브로커에 편지를 넣기 위한 클라이언트

const app = express();

// --- [A] 웹 서버 설정 (HTTP) ---
const HTTP_PORT = process.env.PORT || 3000; 

app.use(cors()); // CORS 에러 방지
app.use(express.json()); // 웹에서 보내는 JSON 데이터 분석
app.use(express.static('public')); 

// 웹페이지가 정상적으로 뜨는지 확인하는 기본 경로
app.get('/', (req, res) => {
    res.send('스마트어시팜 통합 서버가 정상 작동 중입니다!');
});

// 웹 브라우저(휴대폰)에서 제어 버튼을 눌렀을 때 처리하는 API
app.post('/api/control', (req, res) => {
    const { device, command } = req.body; 

    console.log(`[웹에서 명령 수신] 장치: ${device}, 명령: ${command}`);

    // 서버 자체가 자신의 우체국(브로커)에 연결하여 편지(명령)를 넣음
    const localClient = mqtt.connect('mqtt://localhost:1883');
    
    localClient.on('connect', () => {
        // 편지 봉투(Topic)와 내용(Message) 작성
        const topic = `smartassifarm/farm1/control/${device}`;
        const message = command; // "ON", "OFF" 등

        // ESP32가 구독하고 있는 주소로 메시지 발송!
        localClient.publish(topic, message, () => {
            console.log(`[MQTT 발송 완료] ${topic} -> ${message}`);
            localClient.end(); // 발송 후 연결 종료
        });
    });

    res.json({ success: true, message: "명령이 농장으로 전송되었습니다." });
});

app.listen(HTTP_PORT, () => {
    console.log(`🌐 웹 서버가 포트 ${HTTP_PORT}에서 대기 중입니다.`);
});

// --- [B] 사물인터넷 우체국 설정 (MQTT 브로커) ---
const MQTT_PORT = 1883; // MQTT 전용 표준 포트
const mqttServer = net.createServer(aedes.handle);

mqttServer.listen(MQTT_PORT, () => {
    console.log(`📮 MQTT 우체국이 포트 ${MQTT_PORT}에서 업무를 시작했습니다.`);
});

// 누군가(ESP32 등) 우체국에 연결했을 때 알림
aedes.on('client', (client) => {
    console.log(`[새로운 기기 접속] ID: ${client ? client.id : '알 수 없음'}`);
});
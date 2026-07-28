// 1. 필요한 모듈 불러오기 (npm install express aedes net cors mqtt)
const express = require('express');
const aedes = require('aedes')(); // MQTT 우체국(브로커) 모듈 생성
const net = require('net');       // MQTT용 네트워크 모듈
const cors = require('cors');     // 웹 브라우저 보안 에러 방지
const mqtt = require('mqtt');     // 서버 자신이 MQTT 브로커에 편지를 넣기 위한 클라이언트

const app = express();

// --- [A] 웹 서버 설정 (HTTP) ---
const HTTP_PORT = 3000; // 웹페이지 접속 포트 (가비아 환경에 맞게 변경)

app.use(cors()); // CORS 에러 방지
app.use(express.json()); // 웹에서 보내는 JSON 데이터 분석
// 웹 파일들이 있는 폴더 지정 (예: 'public' 폴더 안에 control2.html을 둠)
app.use(express.static('public')); 

// 웹페이지가 정상적으로 뜨는지 확인하는 기본 경로
app.get('/', (req, res) => {
    res.send('스마트어시팜 통합 서버가 정상 작동 중입니다!');
});

// 웹 브라우저(휴대폰)에서 펌프 제어 버튼을 눌렀을 때 처리하는 API
app.post('/api/control', (req, res) => {
    // 이제 웹에서 'targetFarm'을 함께 보내줘야 합니다 (예: { targetFarm: "farm_002", device: "pump", command: "ON" })
    const { targetFarm, device, command } = req.body; 

    console.log(`[제어 명령] 타겟: ${targetFarm}, 장치: ${device}, 명령: ${command}`);

    const localClient = mqtt.connect('mqtt://localhost:1883');
    
    localClient.on('connect', () => {
        // [핵심] 고정된 farm1 대신 변수 사용!
        const topic = `smartassifarm/${targetFarm}/control/${device}`;
        const message = command; 

        localClient.publish(topic, message, () => {
            localClient.end(); 
        });
    });
    res.json({ success: true });
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

// 누군가 우체국을 떠났을 때 알림
aedes.on('clientDisconnect', (client) => {
    console.log(`[기기 연결 끊김] ID: ${client ? client.id : '알 수 없음'}`);
});

// 우체국을 통해 편지(메시지)가 오갈 때 내용 확인
aedes.on('publish', (packet, client) => {
    if (client) {
        // 내부 통신용 메시지 필터링 (불필요한 로그 방지)
        if (!packet.topic.startsWith('$SYS')) {
            console.log(`[메시지 중계] 보낸이: ${client.id}, 주제: ${packet.topic}, 내용: ${packet.payload.toString()}`);
            
            // 만약 ESP32(농장)에서 온 센서 데이터라면? (예: 토양 습도)
            if (packet.topic.includes('sensor')) {
                // 여기에 나중에 데이터베이스(DB)에 저장하는 코드를 넣을 수 있습니다.
                // console.log('센서 데이터를 DB에 저장합니다...');
            }
        }
    }
});
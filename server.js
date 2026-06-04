const admin = require('firebase-admin');
const axios = require('axios');
const express = require('express');
const cors = require('cors'); 
const app = express();

app.use(cors()); 
app.use(express.json());

// ==========================================
// [1] 파이어베이스 및 기존 주문 시스템 설정
// ==========================================
const serviceAccount = require("./firebase-admin-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

db.collection('orders').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
            const order = change.doc.data();
            console.log("새로운 주문 발견:", order);
            await sendTalkNotification(order);
        }
    });
});

async function sendTalkNotification(order) {
    // 네이버 톡톡 API 호출 로직 위치
}

// ==========================================
// [2] 유전리 농장 6개 구역 적외선 펜스 보안 시스템
// ==========================================
// 6개 구역의 실시간 보안 상태를 저장하는 저장소
let yujeonriSecurity = {
    zone1: { bot: false, top: false },
    zone2: { bot: false, top: false },
    zone3: { bot: false, top: false },
    zone4: { bot: false, top: false },
    zone5: { bot: false, top: false },
    zone6: { bot: false, top: false }
};

// 2-1. 6개의 ESP32-C6 보드들이 신호를 보내오는 주소 (POST)
app.post('/api/security/update', (req, res) => {
    const { zone, position, value } = req.body; // 예: "zone3", "top", true
    
    if (yujeonriSecurity[zone]) {
        // 안전하게 true/false 변환하여 저장
        yujeonriSecurity[zone][position] = (value === true || value === 'true');
        
        // 어떤 구역에 침입이 발생했거나 해제되었는지 로그 출력
        console.log(`[경계선 신호] ${zone} - ${position}: ${yujeonriSecurity[zone][position] ? "🚨침입!!" : "✅정상"}`);
        return res.status(200).json({ success: true, message: `${zone} 업데이트 완료` });
    }
    
    return res.status(400).json({ success: false, message: "잘못된 구역(zone) 정보입니다." });
});

// 2-2. 웹 화면(control2.html)이 1초마다 전체 상태를 읽어가는 주소 (GET)
app.get('/api/security/status', (req, res) => {
    res.status(200).json(yujeonriSecurity);
});

// ==========================================
// [3] 서버 구동 포트 설정
// ==========================================
app.listen(3000, () => console.log('어시팜 클라우드 엔진 및 6채널 보안 모듈 가동 중... (Port 3000)'));
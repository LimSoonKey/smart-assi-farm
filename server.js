const admin = require('firebase-admin');
const axios = require('axios');
const express = require('express');

const app = express();
app.use(express.json());

// [보안] 서비스 계정 키 파일(JSON)을 파이어베이스에서 다운로드하여 연결하세요
const serviceAccount = require("./firebase-admin-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 주문 데이터베이스를 실시간으로 감시 (새 주문이 들어오면 실행)
db.collection('orders').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
            const order = change.doc.data();
            console.log("새로운 주문 발견:", order);

            // 여기에 네이버 톡톡 알림 전송 로직 실행
            await sendTalkNotification(order);
        }
    });
});

async function sendTalkNotification(order) {
    // 이전 코드에서 작성한 네이버 톡톡 API 호출 부분
    // order.userKey 등을 사용하여 고객에게 메시지 발송
}

app.listen(3000, () => console.log('어시팜 클라우드 엔진 가동 중...'));
// --- [1] 핀 번호 및 서버 설정 ---
#define MODEM_RX 16
#define MODEM_TX 17
#define RS485_RX 27
#define RS485_TX 18

// ⚠️ 모뎀 전원을 끊었다 붙일 릴레이 제어 핀 (예: 4)
#define MODEM_RESET_RELAY_PIN 4 

// 데이터를 받을 서버 주소 (스마트어시팜)
// 가비아에 등록된 실제 IP 주소로 입력
// 퓨니코드로 변환된 주소를 입력 (예시입니다. 실제 변환된 값을 넣으셔야 합니다)
String serverURL = "http://httpbin.org/get"; 

void setup() {
  Serial.begin(115200);
  
  Serial2.begin(115200, SERIAL_8N1, MODEM_RX, MODEM_TX);
  Serial1.begin(9600, SERIAL_8N1, RS485_RX, RS485_TX);
  
  pinMode(MODEM_RESET_RELAY_PIN, OUTPUT);
  digitalWrite(MODEM_RESET_RELAY_PIN, LOW); 
  
  delay(3000);
  Serial.println("=================================");
  Serial.println("🚜 스마트 어시팜 컨트롤러 부팅 완료");
  Serial.println("=================================");
  
  // 부팅 직후 기지국 연결 상태 확인
  sendATCommand("AT+CSQ", 2000);
  sendATCommand("AT+CEREG?", 2000);
}

void loop() {
  Serial.println("\n[시스템] 서버로 데이터 전송을 시도합니다...");
  
  // 임시 가상 데이터 
  String testData = "?temp=25.4&humi=60.0"; 
  
  sendQuectelData(testData);
  
  delay(30000); // 30초 대기
}

// --- [통신 기능] Quectel 전용 HTTP 전송 함수 ---
void sendQuectelData(String dataParams) {
  String fullURL = serverURL + dataParams;
  int urlLen = fullURL.length(); 
  
  // 1. 인터넷 선 뺐다 꽂기 (SKT Cat.M1 APN 재연결)
  Serial.println("\n[1단계] SKT 인터넷망 접속 시도...");
  sendATCommand("AT+QIDEACT=1", 2000); 
  sendATCommand("AT+QICSGP=1,1,\"lte-m1.sktmobile.com\",\"\",\"\",0", 2000);
  sendATCommand("AT+QIACT=1", 4000);   
  sendATCommand("AT+CGPADDR=1", 2000); // IP 할당 확인
  
  // ★ 추가된 핵심 명령어: 구글 공용 DNS 서버(8.8.8.8) 강제 지정!
  sendATCommand("AT+QIDNSCFG=1,\"8.8.8.8\",\"8.8.4.4\"", 2000);
  
  // HTTP 통신에 1번 인터넷 선 지정
  sendATCommand("AT+QHTTPCFG=\"contextid\",1", 2000);
  
  // 2. URL 길이 전송 및 CONNECT 대기
  Serial.println("\n[2단계] 서버 주소 입력 중...");
  Serial2.print("AT+QHTTPURL=");
  Serial2.print(urlLen);
  Serial2.println(",80");
  delay(1000);
  
  while(Serial2.available()) { Serial.write(Serial2.read()); }
  
  // 3. 실제 URL 텍스트 쏘아 올리기
  Serial2.print(fullURL);
  delay(1000);
  
  while(Serial2.available()) { Serial.write(Serial2.read()); }
  
  // 4. HTTP GET 방식으로 데이터 전송 실행
  Serial.println("\n[3단계] 서버로 데이터 발사!");
  sendATCommand("AT+QHTTPGET=80", 15000); 
}

// --- [유틸리티] AT 명령어를 모뎀으로 보내고 응답을 읽는 함수 ---
void sendATCommand(String command, const int timeout) {
  Serial.println(command); 
  Serial2.println(command); 
  
  long int time = millis();
  while ((time + timeout) > millis()) {
    while (Serial2.available()) {
      Serial.write(Serial2.read()); 
    }
  }
}

// --- [핵심 기능] 모뎀 물리적 리셋 ---
void resetModem() {
  Serial.println("\n[시스템] 통신 오류! 리셋 릴레이를 가동합니다...");
  digitalWrite(MODEM_RESET_RELAY_PIN, HIGH); 
  delay(5000); 
  digitalWrite(MODEM_RESET_RELAY_PIN, LOW);
  delay(15000); 
  Serial.println("[시스템] 모뎀 재부팅 완료.");
}
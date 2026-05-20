#include <WiFi.h>
#include <ESPAsyncWebServer.h> // 웹 서버 라이브러리 (설치 필요)
#include "sensors.h"

AsyncWebServer server(80);

void setup() {
  Serial.begin(115200);

  // 1. 센서 초기화 (sensors.h에 정의된 함수 호출)
  setupSensors();

  // 2. WiFi 연결 로직 (이곳에 작성)
  // WiFi.begin(ssid, password);

  // 3. 웹 서버 경로 설정 (통로 만들기)
  // control2.html에서 /get_status로 요청을 보내면 아래 코드가 응답합니다.
  server.on("/get_status", HTTP_GET, [](AsyncWebServerRequest *request){
    String response = getSensorJson(); // sensors.h에서 만든 JSON 데이터 가져오기
    request->send(200, "application/json", response); 
  });

  server.begin();
}

void loop() {
  // 풍속이나 조도 센서값이 있다면 여기서 주기적으로 업데이트 하는 로직을 넣으세요.
  // 예: windSpeed = analogRead(풍속핀);
}
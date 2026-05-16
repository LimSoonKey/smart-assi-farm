#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h> 
// ESPAsyncWebServer 라이브러리를 사용하신다면 아래 헤더가 필요합니다.
// #include <ESPAsyncWebServer.h> 

// [1] 전역 변수 선언 (정의까지 한꺼번에 처리)
static int pirPins[12] = {14, 27, 26, 25, 33, 32, 13, 12, 15, 2, 4, 5}; 
static bool pirStates[12] = {false};
static float windSpeed = 0.0;
static float lightLux = 0.0;
static bool soundDetected = false;

// [2] 데이터 취합 및 JSON 생성 함수
String getSensorJson() {
    String json = "{";
    json += "\"wind\": " + String(windSpeed, 1) + ",";
    json += "\"lux\": " + String(lightLux, 0) + ",";
    json += "\"sound\": " + String(soundDetected ? 1 : 0) + ",";
    json += "\"pir\": [";
    for(int i = 0; i < 12; i++) {
        pirStates[i] = digitalRead(pirPins[i]); 
        json += String(pirStates[i] ? 1 : 0);
        if(i < 11) json += ",";
    }
    json += "]}";
    return json;
}

// [3] 센서 설정 함수
void setupSensors() {
    for (int i = 0; i < 12; i++) {
        pinMode(pirPins[i], INPUT);
    }
    pinMode(34, INPUT); // 소리 센서
}

#endif
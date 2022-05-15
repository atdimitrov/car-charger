#include <Arduino.h>
#include <WiFi.h>
#include <AsyncJson.h>
#include <AsyncWebSocket.h>
#include <time.h>
#include <ArduinoOTA.h>
#include <SPIFFS.h>
#include "wifi-config.h"
#include "charging-session.h"

#define CAR_CHARGING_PORT 4
#define EMPTY_PORT_1 0
#define EMPTY_PORT_2 15
#define EMPTY_PORT_3 2

AsyncWebServer server(80);

ChargingSession* currentChargingSession;
ChargingSessionStatus lastChargingStatus = notStarted;

void connectToWiFi(WiFiConfig wifiConfig)
{
    Serial.printf("Connecting to WiFi network %s...\n", wifiConfig.ssid);
    
    WiFi.begin(wifiConfig.ssid, wifiConfig.password);

    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print(".");
        delay(1000);
    }

    Serial.println("Connected");
}

void runWebServer()
{
    server.on("/status", HTTP_GET, [](AsyncWebServerRequest *request)
    {
        request->send(200, "text/plain", "Up and running.");
    });

    server.addHandler(new AsyncCallbackJsonWebHandler("/car-charging/start", [](AsyncWebServerRequest *request, JsonVariant &json)
    {
        if (json["offset"].isNull() || json["duration"].isNull())
        {
            request->send(400);
            return;
        }
        
        time_t currentTime = time(NULL);
        uint64_t offset = json["offset"].as<uint64_t>();
        uint64_t duration = json["duration"].as<uint64_t>();

        if (currentChargingSession != nullptr)
        {
            delete currentChargingSession;
        }

        currentChargingSession = new ChargingSession(currentTime + offset, duration);
        
        request->send(200);
    }));

    server.on("/car-charging/stop", HTTP_POST, [](AsyncWebServerRequest *request)
    {
        if (currentChargingSession != nullptr)
        {
            ChargingSessionStatus status = currentChargingSession->getStatus();
            if (status == waiting || status == inProgress)
            {
                currentChargingSession->stop();
                request->send(200);
                return;
            }
        }
        
        request->send(400);
    });

    server.on("/car-charging/status", HTTP_GET, [](AsyncWebServerRequest *request)
    {
        if (currentChargingSession == nullptr)
        {
            request->send(404);
            return;
        }

        StaticJsonDocument<256> doc;

        time_t currentTime = time(NULL);
        uint64_t startTime = currentChargingSession->startTime;
        uint64_t duration = currentChargingSession->duration;
        ChargingSessionStatus status = currentChargingSession->getStatus();
        doc["status"] = status;
        doc["duration"] = duration;
        if (status == waiting)
        {
            doc["timeToStart"] = startTime - currentTime;
            doc["progress"] = 0.0;
        }
        else if (status == inProgress)
        {
            doc["timeToEnd"] = startTime + duration - currentTime;
            doc["progress"] = (double)(currentTime - startTime) / duration;
        }
        else if (status == stopped)
        {
            time_t stopTime = *currentChargingSession->stopTime;
            if (startTime < stopTime)
            {
                doc["progress"] = (double)(stopTime - startTime) / duration;
            }
            else
            {
                doc["progress"] = 0.0;
            }
        }
        else
        {
            doc["progress"] = 1.0;
        }
        
        char result[256];
        serializeJson(doc, result, sizeof(result));
        request->send(200, "application/json", result);
    });

    server.begin();
}

void setupOta()
{
    ArduinoOTA
    .onStart([]() {
        String type;
        if (ArduinoOTA.getCommand() == U_FLASH)
            type = "sketch";
        else // U_SPIFFS
            type = "filesystem";

        // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
        Serial.println("Start updating " + type);
    })
    .onEnd([]() {
        Serial.println("\nEnd");
    })
    .onProgress([](unsigned int progress, unsigned int total) {
        Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
    })
    .onError([](ota_error_t error) {
        Serial.printf("Error[%u]: ", error);
        if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
        else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
        else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
        else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
        else if (error == OTA_END_ERROR) Serial.println("End Failed");
    });

    ArduinoOTA.begin();

    Serial.println("Ready");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
}

void setup()
{
    Serial.begin(115200);

    pinMode(CAR_CHARGING_PORT, OUTPUT);
    pinMode(EMPTY_PORT_1, OUTPUT);
    pinMode(EMPTY_PORT_2, OUTPUT);
    pinMode(EMPTY_PORT_3, OUTPUT);

    digitalWrite(CAR_CHARGING_PORT, HIGH);
    digitalWrite(EMPTY_PORT_1, HIGH);
    digitalWrite(EMPTY_PORT_2, HIGH);
    digitalWrite(EMPTY_PORT_3, HIGH);

    WiFiConfig wifiConfig = readWifiConfig();
    connectToWiFi(wifiConfig);

    setupOta();

    runWebServer();
}

void toggle(int port)
{
    digitalWrite(CAR_CHARGING_PORT, LOW);
    delay(250);
    digitalWrite(CAR_CHARGING_PORT, HIGH);
}

void loop()
{
    ArduinoOTA.handle();

    if (currentChargingSession != nullptr)
    {
        ChargingSessionStatus status = currentChargingSession->getStatus();
        if (status != lastChargingStatus)
        {
            if (status == inProgress || lastChargingStatus == inProgress)
            {
                toggle(CAR_CHARGING_PORT);
            }

            lastChargingStatus = status;
        }
    }
}
#include <Arduino.h>
#include <WiFi.h>
#include <AsyncJson.h>
#include <AsyncWebSocket.h>
#include <time.h>
#include "wifi-config.h"
#include "charging-session.h"

#define CAR_CHARGING_PORT 15
#define EMPTY_PORT_1 2
#define EMPTY_PORT_2 0
#define EMPTY_PORT_3 4

AsyncWebServer server(80);

ChargingSession* currentChargingSession;

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
    server.addHandler(new AsyncCallbackJsonWebHandler("/car-charging/start", [](AsyncWebServerRequest *request, JsonVariant &json)
    {
        if (json["offset"].isNull() || json["duration"].isNull())
        {
            request->send(400);
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

void setup()
{
    Serial.begin(115200);

    WiFiConfig wifiConfig = readWifiConfig();
    connectToWiFi(wifiConfig);

    runWebServer();

    pinMode(CAR_CHARGING_PORT, OUTPUT);
    pinMode(EMPTY_PORT_1, OUTPUT);
    pinMode(EMPTY_PORT_2, OUTPUT);
    pinMode(EMPTY_PORT_3, OUTPUT);

    digitalWrite(CAR_CHARGING_PORT, HIGH);
    digitalWrite(EMPTY_PORT_1, HIGH);
    digitalWrite(EMPTY_PORT_2, HIGH);
    digitalWrite(EMPTY_PORT_3, HIGH);
}

void loop()
{
    if (currentChargingSession != nullptr)
    {
        ChargingSessionStatus status = currentChargingSession->getStatus();
        if (status == inProgress)
        {
            digitalWrite(CAR_CHARGING_PORT, LOW);
            return;
        }
    }

    digitalWrite(CAR_CHARGING_PORT, HIGH);
}
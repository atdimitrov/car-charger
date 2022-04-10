#include <Arduino.h>
#include <WiFi.h>
#include <AsyncJson.h>
#include <AsyncWebSocket.h>
#include "wifi-config.h"

AsyncWebServer server(80);

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
    AsyncCallbackJsonWebHandler* effectHandler = new AsyncCallbackJsonWebHandler("/test", [](AsyncWebServerRequest *request, JsonVariant &json)
    {
        if (json["value"].as<uint8_t>() == 1)
        {
            request->send(200);
        }
        else
        {
            request->send(400);
        }
    });

    server.addHandler(effectHandler);
    server.begin();
}

void setup() {
    Serial.begin(115200);

    WiFiConfig wifiConfig = readWifiConfig();
    connectToWiFi(wifiConfig);

    runWebServer();
}

void loop() {
}
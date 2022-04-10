#ifndef CHARGING_SESSION_H
#define CHARGING_SESSION_H

#include <Arduino.h>
#include <time.h>

enum ChargingSessionStatus
{
    waiting,
    inProgress,
    ended,
    stopped
};

struct ChargingSession
{
    public:
        time_t startTime;
        uint64_t duration;
        time_t* stopTime;

        ChargingSession(const time_t startTime, const uint64_t duration);
        ~ChargingSession();

        ChargingSessionStatus getStatus();
        void stop();
};

#endif
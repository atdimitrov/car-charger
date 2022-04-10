#include "charging-session.h"
#include "time.h"

ChargingSession::ChargingSession(const time_t startTime, const uint64_t duration)
    : startTime(startTime), duration(duration), stopTime(nullptr)
{
}

ChargingSession::~ChargingSession()
{
    if (stopTime != nullptr)
    {
        delete stopTime;
    }
}

ChargingSessionStatus ChargingSession::getStatus()
{
    if (stopTime != nullptr)
    {
        return stopped;
    }

    time_t currentTime = time(NULL);
    if (currentTime < startTime)
    {
        return waiting;
    }
    else if (currentTime < startTime + duration)
    {
        return inProgress;
    }
    else
    {
        return ended;
    }
}

void ChargingSession::stop()
{
    stopTime = new time_t();
    time(stopTime);
}
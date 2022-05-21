export const startSessionType = 'start-session';
export const refreshSessionStatusType = 'refresh-session-status';

export const startSession = (payload) => ({ type: startSessionType, payload });
export const refreshSessionStatus = () => ({ type: refreshSessionStatusType });

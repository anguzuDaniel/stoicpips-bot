"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotLogger = void 0;
const MAX_LOGS = 50;
const logs = {};
exports.BotLogger = {
    log: (userId, message, type = 'info', symbol) => {
        if (!logs[userId]) {
            logs[userId] = [];
        }
        const newLog = {
            id: Math.random().toString(36).substring(7),
            userId,
            message,
            type,
            timestamp: new Date().toLocaleTimeString(),
            symbol
        };
        logs[userId].unshift(newLog); // Add to beginning
        // Limit size
        if (logs[userId].length > MAX_LOGS) {
            logs[userId] = logs[userId].slice(0, MAX_LOGS);
        }
    },
    getLogs: (userId) => {
        return logs[userId] || [];
    },
    clearLogs: (userId) => {
        logs[userId] = [];
    }
};

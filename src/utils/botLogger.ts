export interface LogEntry {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  symbol?: string;
}

const MAX_LOGS = 50;
const logs: Record<string, LogEntry[]> = {};

export const BotLogger = {
  log: (userId: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', symbol?: string) => {
    if (!logs[userId]) {
      logs[userId] = [];
    }

    const newLog: LogEntry = {
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

  getLogs: (userId: string) => {
    return logs[userId] || [];
  },

  clearLogs: (userId: string) => {
    logs[userId] = [];
  }
};

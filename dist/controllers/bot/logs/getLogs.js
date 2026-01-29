"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogs = void 0;
const botLogger_1 = require("../../../utils/botLogger");
const getLogs = async (req, res) => {
    try {
        const userId = req.user.id;
        const logs = botLogger_1.BotLogger.getLogs(userId);
        res.json({ logs });
    }
    catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ error: "Failed to fetch logs" });
    }
};
exports.getLogs = getLogs;

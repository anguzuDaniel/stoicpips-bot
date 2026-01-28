import { Response } from 'express';
import { AuthenticatedRequest } from "../../../types/AuthenticatedRequest";
import { BotLogger } from "../../../utils/botLogger";

export const getLogs = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const logs = BotLogger.getLogs(userId);
        res.json({ logs });
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ error: "Failed to fetch logs" });
    }
};

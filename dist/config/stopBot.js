import { activeBots } from "./activeBots.js";
export const stopBot = async (req, res) => {
    const user = req.user;
    const ws = activeBots[user.id];
    if (!ws)
        return res.json({ message: "No bot is running" });
    ws.close();
    delete activeBots[user.id];
    res.json({ message: "Bot stopped" });
};
//# sourceMappingURL=stopBot.js.map
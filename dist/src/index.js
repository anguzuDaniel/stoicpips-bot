// src/index.ts
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import botRoutes from "./routes/bot.routes";
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/bot", botRoutes);
// Health check
app.get("/", (req, res) => res.send("API is running"));
// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//# sourceMappingURL=index.js.map
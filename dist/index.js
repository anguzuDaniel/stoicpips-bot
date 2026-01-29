"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const bot_routes_1 = __importDefault(require("./routes/bot.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: true, // Reflect request origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/bot', bot_routes_1.default);
app.use('/api/v1/user', user_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/payments', payment_routes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error("🔥 Global Error:", err);
    // Ensure CORS headers even on error
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    const status = err.status || 500;
    res.status(status).json({
        error: err.message || "Internal Server Error",
        status: status
    });
});
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

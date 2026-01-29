"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriv = void 0;
const DerivWebSocket_1 = require("../deriv/DerivWebSocket");
const deriv = new DerivWebSocket_1.DerivWebSocket({
    apiToken: process.env.DERIV_API_TOKEN,
    appId: process.env.DERIV_APP_ID || '1089',
    reconnect: true,
    maxReconnectAttempts: 10,
    heartbeatInterval: 15000
});
exports.deriv = deriv;
deriv.connect();

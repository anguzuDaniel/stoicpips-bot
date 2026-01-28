"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cors_1 = __importDefault(require("cors"));
const authRoutes = require('./routes/auth.routes');
const botRoutes = require('./routes/bot.routes');
const userRoutes = require('./routes/user.routes');
const app = express();
app.use((0, cors_1.default)());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bot', botRoutes);
app.use('/api/v1/user', userRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

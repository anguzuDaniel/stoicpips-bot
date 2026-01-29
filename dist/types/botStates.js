"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.botStates = void 0;
exports.botStates = new Map();
// Added to handle global flags that are not per-user
exports.botStates.globalPause = false;
exports.botStates.pauseReason = null;
exports.botStates.pausedAt = null;
exports.botStates.pausedBy = null;
exports.botStates.resumedAt = null;
exports.botStates.resumedBy = null;

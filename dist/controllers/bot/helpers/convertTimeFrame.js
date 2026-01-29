"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const convertTimeframe = (tf) => {
    if (!tf)
        return 60;
    return tf < 60 ? tf * 60 : tf; // convert minutes to seconds
};
exports.default = convertTimeframe;

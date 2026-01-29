"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const riseFallSymbols = [
    "R_10", "R_25", "R_50", "R_75", "R_100",
    "R_10_1HZ", "R_25_1HZ", "R_50_1HZ", "R_75_1HZ", "R_100_1HZ"
];
function supportsRiseFall(symbol) {
    return riseFallSymbols.includes(symbol);
}
exports.default = supportsRiseFall;

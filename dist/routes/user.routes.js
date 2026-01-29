"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user/user.controller");
const router = (0, express_1.Router)();
router.get("/profile", user_controller_1.getUserProfile);
router.post("/update-plan", user_controller_1.updatePlan);
router.post("/update-bank-info", user_controller_1.updateBankInfo);
exports.default = router;

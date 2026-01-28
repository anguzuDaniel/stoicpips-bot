"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const { getUserProfile, updatePlan } = require("../controllers/user.controller");
const router = (0, express_1.Router)();
router.get("/profile", getUserProfile);
router.post("/update-plan", updatePlan);
module.exports = router;

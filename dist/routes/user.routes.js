"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController = require("../controllers/user/user.controller");
const router = (0, express_1.Router)();
router.get("/profile", userController.getUserProfile);
router.post("/update-plan", userController.updatePlan);
module.exports = router;

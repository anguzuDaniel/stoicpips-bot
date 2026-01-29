"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = require("../controllers/auth/auth.controller");
const router = (0, express_1.Router)();
router.post("/login", authController.loginUser);
router.post("/signup", authController.signupUser);
// router.get("/profile", requireAuth, getUserProfile);
module.exports = router;

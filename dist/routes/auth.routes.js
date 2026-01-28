"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const { loginUser, signupUser } = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post("/login", loginUser);
router.post("/signup", signupUser);
// router.get("/profile", requireAuth, getUserProfile);
module.exports = router;

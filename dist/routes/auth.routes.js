"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth/auth.controller");
const router = (0, express_1.Router)();
router.post("/login", auth_controller_1.loginUser);
router.post("/signup", auth_controller_1.signupUser);
exports.default = router;

import { Router } from "express";
const authController = require("../controllers/auth/auth.controller");

const router = Router();

router.post("/login", authController.loginUser);
router.post("/signup", authController.signupUser);
// router.get("/profile", requireAuth, getUserProfile);

module.exports = router;

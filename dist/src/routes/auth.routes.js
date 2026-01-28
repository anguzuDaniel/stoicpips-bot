import { Router } from "express";
import { loginUser, signupUser } from "../controllers/auth.controller.js";
import { requireAuth } from "middleware/authMiddleware.js";
import { getUserProfile } from "controllers/user.controller.js";
const router = Router();
router.post("/login", loginUser);
router.post("/signup", signupUser);
router.get("/profile", requireAuth, getUserProfile);
export default router;
//# sourceMappingURL=auth.routes.js.map
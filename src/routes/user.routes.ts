import { Router } from "express";
import { getUserProfile, updatePlan, updateBankInfo } from "../controllers/user/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/profile", authenticateToken, getUserProfile);
router.post("/update-plan", authenticateToken, updatePlan);
router.post("/update-bank-info", authenticateToken, updateBankInfo);

export default router;

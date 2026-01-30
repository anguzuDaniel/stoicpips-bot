import { Router } from "express";
import { getUserProfile, updatePlan, updateBankInfo, updateProfile } from "../controllers/user/user.controller";
import { reportBug } from "../controllers/user/bugReport";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/profile", authenticateToken, getUserProfile);
router.post("/update-plan", authenticateToken, updatePlan);
router.post("/update-bank-info", authenticateToken, updateBankInfo);
router.post("/update-profile", authenticateToken, updateProfile);
router.post("/report-bug", authenticateToken, reportBug);

export default router;

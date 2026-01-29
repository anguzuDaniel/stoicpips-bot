import { Router } from "express";
import { getUserProfile, updatePlan, updateBankInfo } from "../controllers/user/user.controller";

const router = Router();

router.get("/profile", getUserProfile);
router.post("/update-plan", updatePlan);
router.post("/update-bank-info", updateBankInfo);

export default router;

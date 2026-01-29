import { Router } from "express";
const userController = require("../controllers/user/user.controller");

const router = Router();

router.get("/profile", userController.getUserProfile);
router.post("/update-plan", userController.updatePlan);
router.post("/update-bank-info", userController.updateBankInfo);

export default router;

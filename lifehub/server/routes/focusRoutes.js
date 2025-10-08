import express from "express";
import { getFocusStats, updateFocusStats } from "../controllers/focusController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getFocusStats);
router.post("/", updateFocusStats);

export default router;
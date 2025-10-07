import express from "express";
import {
  getWellnessLogs,
  createWellnessLog,
  updateWellnessLog,
  deleteWellnessLog,
  cleanupDuplicateLogs,
} from "../controllers/wellnessController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/", getWellnessLogs);
router.post("/", createWellnessLog);
router.put("/:id", updateWellnessLog);
router.delete("/:id", deleteWellnessLog);
router.post("/cleanup", cleanupDuplicateLogs);

export default router;

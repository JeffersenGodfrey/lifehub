import express from "express";
import {
  getTimeline,
  createTimelineItem,
  updateTimelineItem,
  deleteTimelineItem,
} from "../controllers/timelineController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getTimeline);
router.post("/", createTimelineItem);
router.put("/:id", updateTimelineItem);
router.delete("/:id", deleteTimelineItem);

export default router;
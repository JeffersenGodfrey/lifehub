import express from "express";
import {
  createOrUpdateUser,
  getUserProfile,
  updateNotificationSettings,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/profile", createOrUpdateUser);
router.get("/profile", getUserProfile);
router.put("/notifications", updateNotificationSettings);

export default router;
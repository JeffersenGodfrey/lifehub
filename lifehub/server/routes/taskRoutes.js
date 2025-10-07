import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = express.Router();

// Test auth middleware (replace later with real auth)
router.use((req, res, next) => {
  req.userId = "12345"; // temporary test userId
  next();
});

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;

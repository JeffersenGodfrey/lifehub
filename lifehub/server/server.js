import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes.js";
import wellnessRoutes from "./routes/wellnessRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import timelineRoutes from "./routes/timelineRoutes.js";
import focusRoutes from "./routes/focusRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://lifehub-task-iwcoyfws1-jeffersen-godfreys-projects.vercel.app', 'https://lifehub-task.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
// Test routes without auth
app.get('/api/test', (req, res) => {
  res.json({ message: 'API working', timestamp: new Date() })
})

app.use("/api/tasks", taskRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/users", userRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/focus", focusRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("LifeHub API is running! Updated CORS");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📧 Email notifications ready (configure EMAIL_USER and EMAIL_PASS)');
});

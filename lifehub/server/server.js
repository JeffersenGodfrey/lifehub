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

// Middleware - Allow all origins for now
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Handle preflight requests
app.options('*', cors());
app.use(express.json());
// Test routes without auth
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API working', 
    timestamp: new Date(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// Middleware to check DB connection for data routes only
app.use('/api/(tasks|habits|wellness|users|timeline|focus)', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  next();
});

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

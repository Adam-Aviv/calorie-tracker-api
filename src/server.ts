import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import foodRoutes from "./routes/foods";
import logRoutes from "./routes/logs";
import weightRoutes from "./routes/weight";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB only if not in test mode (tests use in-memory DB)
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Middleware
const allowedOrigins = [
  "http://localhost:8100",
  "http://localhost:8100/", // Added slash just in case
  "http://localhost:8200",
  "capacitor://localhost",
  "http://localhost",
  "https://api-calorie-tracker.adam-aviv.com",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // 1. Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);

    // 2. Check if the origin is in our list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error(`❌ CORS blocked this origin: ${origin}`);
      return callback(new Error("CORS policy violation"), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/weight", weightRoutes);

// Health check route
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "Calorie Calculator API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
interface ErrorWithStatus extends Error {
  status?: number;
}

app.use(
  (err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
);

// Start server only if not in test mode
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

export default app;

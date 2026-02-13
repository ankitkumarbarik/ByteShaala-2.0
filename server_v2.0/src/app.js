import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { fileSize } from "./constants.js";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware.js";
import { getUserById } from "./controllers/user.controller.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true, limit: fileSize }));
app.use(express.json({ limit: fileSize }));
app.use(express.static("public"));
app.use(cookieParser());

// Direct route for inter-service communication (no auth required)
app.get("/get-user/:userId", getUserById);

// routes import
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import courseRouter from "./routes/course.route.js";
import sectionRouter from "./routes/section.route.js";
import lectureRouter from "./routes/lecture.route.js";
import cartRouter from "./routes/cart.route.js";

// routes define
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/course", lectureRouter);
app.use("/api/v1/course", sectionRouter);
app.use("/api/v1/cart", cartRouter);

// global error handler - one last middleware
app.use(errorMiddleware);

export default app;

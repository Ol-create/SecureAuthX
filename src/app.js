import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { securityMiddleware } from "./middleware/security.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
securityMiddleware(app);

app.use("/auth", authRoutes);

app.use(errorHandler);

export default app;

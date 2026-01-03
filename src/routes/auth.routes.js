import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { loginLimiter } from "../middleware/loginRateLimiter.js";
import { refreshToken } from "../controllers/refresh.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", loginLimiter, login);


router.post("/refresh", refreshToken);

export default router;

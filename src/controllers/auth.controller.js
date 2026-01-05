
import User from "../models/User.js";
import Session from "../models/Session.js";
import { parseDevice } from "../utils/device.util.js";
import { hashPassword, verifyPassword } from "../utils/password.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/token.service.js";
import { hashToken } from "../utils/tokenHash.util.js";
import { securityConfig } from "../config/security.js";

export async function register(req, res) {
  const { email, password } = req.body;
  const hashed = await hashPassword(password);

  await User.create({ email, password: hashed });
  res.status(201).json({ message: "User registered" });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+refreshToken");

  // 🔒 Uniform response (prevents enumeration)
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // 🚫 Account locked
  if (user.isLocked) {
    return res.status(423).json({
      message: "Account temporarily locked. Try again later.",
    });
  }

  const validPassword = await verifyPassword(password, user.password);

  // ❌ Wrong password
  if (!validPassword) {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= securityConfig.MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + securityConfig.LOCK_TIME_MS);
      user.failedLoginAttempts = 0;
    }

    await user.save();
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // ✅ Successful login
  user.failedLoginAttempts = 0;
  user.lockUntil = null;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = hashToken(refreshToken);
  await user.save();

  // 🧭 Create device-bound session
  await Session.create({
    user: user._id,
    refreshTokenHash: hashToken(refreshToken),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    device: parseDevice(req.headers["user-agent"]),
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.json({ accessToken });
}


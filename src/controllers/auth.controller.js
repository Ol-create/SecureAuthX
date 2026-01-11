import User from "../models/User.js";
import Session from "../models/Session.js";
import { parseDevice } from "../utils/device.util.js";
import { verifyPassword } from "../utils/password.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/token.service.js";
import { hashToken } from "../utils/tokenHash.util.js";
import { securityConfig } from "../config/security.js";
import { sendSecurityAlert } from "../services/securityAlert.service.js";

export async function login(req, res) {
  const { email, password } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.headers["user-agent"];
  const device = parseDevice(userAgent);

  const user = await User.findOne({ email });

  // 🔒 Uniform response
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
  await user.save();

  // 🔍 Detect new device BEFORE creating session
  const existingSession = await Session.findOne({
    user: user._id,
    device,
    isValid: true,
  });

  const isNewDevice = !existingSession;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // 🧭 Create device-bound session
  await Session.create({
    user: user._id,
    refreshTokenHash: hashToken(refreshToken),
    ipAddress,
    userAgent,
    device,
  });

  // 🔔 Alert ONLY if device is new
  if (isNewDevice) {
    await sendSecurityAlert({
      user,
      type: "NEW_LOGIN",
      ipAddress,
      device,
    });
  }

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.json({ accessToken });
}

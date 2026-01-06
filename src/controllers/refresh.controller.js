import jwt from "jsonwebtoken";
import Session from "../models/Session.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/token.service.js";
import { hashToken } from "../utils/tokenHash.util.js";
import { parseDevice } from "../utils/device.util.js";

export async function refreshToken(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  try {
    // Verify refresh token signature
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const tokenHash = hashToken(token);

    // Find valid session
    const session = await Session.findOne({
      refreshTokenHash: tokenHash,
      isValid: true,
    });

    // Token reuse / stolen token
    if (!session) {
      return res.sendStatus(403);
    }

    const currentIP = req.ip;
    const currentUA = req.headers["user-agent"];
    const currentDevice = parseDevice(currentUA);

    // Device mismatch → invalidate session
    if (session.device !== currentDevice) {
      session.isValid = false;
      await session.save();
      return res.sendStatus(403);
    }

    // IP change → allow but update
    if (session.ipAddress !== currentIP) {
      session.ipAddress = currentIP;
    }

    // Rotate refresh token
    const newRefreshToken = generateRefreshToken({
      _id: payload.id,
    });

    session.refreshTokenHash = hashToken(newRefreshToken);
    session.lastUsedAt = new Date();
    await session.save();

    // Issue new access token
    const newAccessToken = generateAccessToken({
      _id: payload.id,
      role: payload.role,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.json({ accessToken: newAccessToken });
  } catch {
    return res.sendStatus(403);
  }
}

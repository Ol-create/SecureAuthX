import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/token.service.js";
import { hashToken } from "../utils/tokenHash.util.js";

export async function refreshToken(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(payload.id).select("+refreshToken");
    if (!user) return res.sendStatus(403);

    const tokenHash = hashToken(token);

    if (user.refreshToken !== tokenHash) {
      // Token reuse detected
      user.refreshToken = null;
      await user.save();
      return res.sendStatus(403);
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = hashToken(newRefreshToken);
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.json({ accessToken: newAccessToken });
  } catch {
    res.sendStatus(403);
  }
}

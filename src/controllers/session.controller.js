import Session from "../models/Session.js";
import { hashToken } from "../utils/tokenHash.util.js";

export async function logout(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(204);

  await Session.findOneAndUpdate(
    { refreshTokenHash: hashToken(token) },
    { isValid: false }
  );

  res.clearCookie("refreshToken");
  res.sendStatus(204);
}


export async function logoutAll(req, res) {
  await Session.updateMany({ user: req.user.id }, { isValid: false });

  res.clearCookie("refreshToken");
  res.sendStatus(204);
}
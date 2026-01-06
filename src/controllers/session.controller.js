import Session from "../models/Session.js";
import { hashToken } from "../utils/tokenHash.util.js";

export async function listSessions(req, res) {
  const sessions = await Session.find({
    user: req.user.id,
    isValid: true,
  }).sort({ lastUsedAt: -1 });

  const currentToken = req.cookies.refreshToken
    ? hashToken(req.cookies.refreshToken)
    : null;

  const response = sessions.map((session) => ({
    id: session._id,
    device: session.device,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    lastUsedAt: session.lastUsedAt,
    createdAt: session.createdAt,
    isCurrent: currentToken && session.refreshTokenHash === currentToken,
  }));

  res.json({ sessions: response });
}

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
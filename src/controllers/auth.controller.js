import User from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/token.service.js";

import { hashToken } from "../utils/tokenHash.util.js";

export async function register(req, res) {
  const { email, password } = req.body;
  const hashed = await hashPassword(password);

  await User.create({ email, password: hashed });
  res.status(201).json({ message: "User registered" });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+refreshToken");

  if (!user || !(await verifyPassword(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = hashToken(refreshToken);
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.json({ accessToken });
}

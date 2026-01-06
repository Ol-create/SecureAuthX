import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { listSessions } from "../controllers/session.controller.js";

const router = express.Router();

router.get("/", authenticate, listSessions);

export default router;

import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { listSessions } from "../controllers/session.controller.js";
import { logoutAllSessions } from "../controllers/session.controller.js";

const router = express.Router();

router.get("/", authenticate, listSessions);
router.delete("/logout-all", authenticate, logoutAllSessions);

export default router;

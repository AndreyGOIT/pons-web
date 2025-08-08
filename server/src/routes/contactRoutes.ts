// server/src/routes/contactRoutes.ts
import { Router } from "express";
import { submitMessage } from "../controllers/contactController";

const router = Router();

// Публичная форма
router.post("/", submitMessage as any); // POST /api/contact

export default router;
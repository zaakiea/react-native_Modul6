import express from "express";
import { ThresholdsController } from "../controllers/thresholdsController.js";
import { authMiddleware } from "../authMiddleware.js"; // Import middleware

const router = express.Router();

// Terapkan middleware hanya pada rute yang digunakan oleh ControlScreen
router.get("/", authMiddleware, ThresholdsController.list);
router.post("/", authMiddleware, ThresholdsController.create);

// Biarkan rute 'latest' tetap publik untuk simulator
router.get("/latest", ThresholdsController.latest);

export default router;

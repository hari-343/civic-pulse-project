import express from "express";
import { upload } from "../config/cloudinary.js";
import {
  createGrievance,
  getGrievances,
  updateStatus,
  resolveGrievance,
} from "../controllers/grievanceController.js";

const router = express.Router();

router.post("/", upload.single("image"), createGrievance);
router.get("/", getGrievances);
router.patch("/:id/status", updateStatus);
router.patch("/:id/resolve", upload.single("image"), resolveGrievance);

export default router;

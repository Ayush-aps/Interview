import express from "express";
import {
  uploadResume,
  getResume,
  deleteResume,
} from "../controllers/resume.controller.js";
import protect from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/upload", protect, upload.single("resume"), uploadResume);

router.get("/", protect, getResume);

router.delete("/", protect, deleteResume);

export default router;
import express from "express";
import {
  generateReport,
  getReport,
  getAllReports,
} from "../controllers/report.controller.js";
import protect from "../middlewares/isAuthenticated.js";

const router = express.Router();

// generate report after interview completes
router.post("/generate/:interviewId", protect, generateReport);

// get all reports of logged in user
router.get("/all", protect, getAllReports);

// get report of a specific interview
router.get("/:interviewId", protect, getReport);


export default router;
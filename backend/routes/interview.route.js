import express from "express";
import {
  startInterview,
  sendMessage,
  completeInterview,
  getInterview,
  getAllInterviews,
  abandonInterview,
  compileCode
} from "../controllers/interview.controller.js";
import protect from "../middlewares/isAuthenticated.js";

const router = express.Router();


// user picks topic + difficulty → AI asks first question
router.post("/start", protect, startInterview);

// user sends answer → AI replies with next question
router.post("/:id/message", protect, sendMessage);


router.put("/:id/complete", protect, completeInterview);


router.put("/:id/abandon", protect, abandonInterview);



router.get("/all", protect, getAllInterviews);


// get one full interview with all messages
router.get("/:id", protect, getInterview);


router.post("/compile", protect, compileCode);


export default router;
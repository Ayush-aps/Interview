import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractText } from "unpdf"; 
import {
  startAgenticInterview,
  processAgenticAnswer,
  finalizeAgenticInterview,
  compileWithJdoodle,
} from "../services/interviewAgentService.js";

// Call Gemini AI 

const callAI = async (messages) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = messages
    .map((msg) => {
      if (msg.role === "system") return `Instructions: ${msg.content}`;
      if (msg.role === "user") return `Candidate: ${msg.content}`;
      if (msg.role === "assistant") return `Interviewer: ${msg.content}`;
    })
    .join("\n\n");

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// Build system prompt
const buildSystemPrompt = (topic, difficulty, userName, interviewType, resumeText, duration) => {
  const codingInstructions = interviewType === "coding" || interviewType === "mixed" 
    ? `\n- If the candidate submits code, evaluate it. Provide the Time and Space complexity using exactly this format: [TIME]: O(...) and [SPACE]: O(...).` 
    : "";

  const resumeContext = resumeText 
    ? `\n\nCRITICAL CONTEXT: The candidate has provided their resume. You MUST base some of your questions specifically on their past projects, experience, and the tech stack mentioned here:\n<RESUME_DATA>\n${resumeText.substring(0, 2500)}\n</RESUME_DATA>\n\n`
    : "";

  // 🔥 DYNAMIC QUESTION COUNT LOGIC
  const interviewDuration = parseInt(duration) || 30;
  let targetQuestions = 7; // Default for 30 mins
  
  if (interviewDuration <= 15) targetQuestions = 5;
  else if (interviewDuration >= 45) targetQuestions = 9;

  return `
You are IntervueX, a professional technical interviewer at a top tech company.
You are interviewing ${userName} for a ${topic} role.
Difficulty level: ${difficulty}. Interview Length: ${interviewDuration} minutes.${resumeContext}

Your rules:
- Ask ONE question at a time. Never ask multiple questions together.
- After the candidate answers, give brief feedback on their answer (2-3 lines).
- Score their answer out of 10.
- Then ask the next question.
- 🔥 Ask a total of EXACTLY ${targetQuestions} questions, then politely conclude the interview.
- Keep a conversational, professional tone.${codingInstructions}

Your response format for each question:
[FEEDBACK]: <feedback on previous answer, skip this for first question>
[SCORE]: <score out of 10, skip this for first question>
[TIME]: <Time complexity, ONLY if they submitted code>
[SPACE]: <Space complexity, ONLY if they submitted code>
[QUESTION]: <your next question>

Start the interview now with your first question. Make it specific to the role or their resume.
`;
};

// Parse AI outputs
const parseScore = (aiMessage) => {
  const match = aiMessage.match(/\[SCORE\]:\s*(\d+)/);
  return match ? parseInt(match[1]) : 0;
};
const parseTimeComplexity = (aiMessage) => {
  const match = aiMessage.match(/\[TIME\]:\s*(O\([^)]+\))/i);
  return match ? match[1] : "";
};
const parseSpaceComplexity = (aiMessage) => {
  const match = aiMessage.match(/\[SPACE\]:\s*(O\([^)]+\))/i);
  return match ? match[1] : "";
};


// Start a new interview 

export const startInterview = async (req, res) => {
  try {
    const { topic, roleCategory, selectedRole, difficulty, type, resumeUrl, duration } = req.body;
    const started = await startAgenticInterview({
      userId: req.userId,
      topic,
      roleCategory,
      selectedRole,
      difficulty: difficulty || "medium",
      type: type || "text",
      resumeUrl,
      duration: duration || 30,
    });

    res.status(201).json({
      success: true,
      message: "Interview started",
      interviewId: started.interview._id,
      aiMessage: started.aiMessage,
    });
  } catch (error) {
    console.error("🔥 [Backend Crash in startInterview]:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Send a message in interview 

export const sendMessage = async (req, res) => {
  try {
    const { userMessage, codeSubmitted, languageUsed } = req.body;
    const updated = await processAgenticAnswer({
      interviewId: req.params.id,
      userId: req.userId,
      userMessage,
      codeSubmitted,
      languageUsed,
    });

    res.json({
      success: true,
      aiMessage: updated.aiMessage,
      questionScore: updated.evaluation?.score || 0,
      timeComplexity: updated.evaluation?.timeComplexity || "",
      spaceComplexity: updated.evaluation?.spaceComplexity || "",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Complete interview

export const completeInterview = async (req, res) => {
  try {
    const finalized = await finalizeAgenticInterview({
      interviewId: req.params.id,
      userId: req.userId,
    });

    res.json({
      success: true,
      message: "Interview completed",
      totalScore: finalized.totalScore,
      finalSummary: finalized.report?.performanceSummary || "Interview completed successfully.",
      isPassed: finalized.interview.isPassed,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Abandon interview

export const abandonInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    if (interview.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    interview.status = "abandoned";
    interview.completedAt = new Date();
    await interview.save();

    res.json({ success: true, message: "Interview abandoned" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get single interview 

export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    if (interview.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get all interviews of user 

export const getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("-messages");

    res.json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Compile code via JDoodle 

export const compileCode = async (req, res) => {
  try {
    const { sourceCode, languageId } = req.body;
    const output = await compileWithJdoodle({
      sourceCode,
      languageId,
      jdoodleClientId: process.env.JDOODLE_CLIENT_ID,
      jdoodleClientSecret: process.env.JDOODLE_CLIENT_SECRET,
    });
    res.status(200).json({ output: output || "Execution completed with no output." });

  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message;
    console.error("JDoodle API Error:", errorMessage);
    res.status(200).json({ 
      output: `❌ Compiler Error: ${errorMessage}\nPlease check your code or JDoodle limits.` 
    });
  }
};
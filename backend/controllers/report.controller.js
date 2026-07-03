import Report from "../models/report.model.js";
import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateInterviewReport } from "../agents/reportAgent.js";

// Call Gemini AI

const callAI = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
};


// Parse AI report response 

const parseReportResponse = (aiResponse) => {
  // extract each section from AI response
  const extract = (tag) => {
    const match = aiResponse.match(
      new RegExp(`\\[${tag}\\]:\\s*(.+?)(?=\\[|$)`, "s")
    );
    return match ? match[1].trim() : "";
  };

  const strongRaw = extract("STRONG");
  const weakRaw = extract("WEAK");
  const studyRaw = extract("STUDY");

  return {
    performanceSummary: extract("SUMMARY"),
    toneFeedback: extract("TONE"),
    strongTopics: strongRaw
      ? strongRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    weakTopics: weakRaw
      ? weakRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    studyPlan: studyRaw
      ? studyRaw.split(",").map((s) => s.trim()).filter(Boolean).map((topic) => ({
        topic,
        whatToStudy: `Focus on improving ${topic} concepts`,
        priority: "high",
      }))
      : [],
    nextInterviewTopic: extract("NEXT"),
  };
};


// Generate report after interview

export const generateReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);

    // checks
    if (!interview) {
      return res
        .status(404)
        .json({ success: false, message: "Interview not found" });
    }

    if (interview.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    if (interview.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Interview is not completed yet",
      });
    }

    // check if report already exists
    const existingReport = await Report.findOne({
      interviewId: interview._id,
    });
    if (existingReport) {
      return res.status(200).json({
        success: true,
        message: "Report already exists",
        report: existingReport,
      });
    }

    // build the full conversation for AI
    const conversation = interview.messages
      .map((msg) => {
        const role = msg.role === "ai" ? "Interviewer" : "Candidate";
        return `${role}: ${msg.content}`;
      })
      .join("\n\n");

    const user = await User.findById(interview.userId);

    let parsed;
    try {
      parsed = await generateInterviewReport({
        topic: interview.topic,
        difficulty: interview.difficulty,
        totalScore: interview.totalScore,
        conversation,
        questionFeedbacks: interview.questionFeedbacks,
        candidateProfile: {
          name: user?.name || "",
          targetRole: user?.targetRole || "",
        },
        memorySummary: {
          messageCount: interview.messages.length,
          questionCount: interview.questionFeedbacks.length,
        },
        personality: "Friendly",
      });
    } catch (error) {
      const weakTopics = interview.questionFeedbacks.filter((item) => item.score < 6).map((item) => item.question).slice(0, 5);
      const strongTopics = interview.questionFeedbacks.filter((item) => item.score >= 6).map((item) => item.question).slice(0, 5);
      const nextInterviewTopic = weakTopics[0] || interview.topic || "core fundamentals";

      parsed = {
        performanceSummary: `Offline fallback report for ${interview.topic}. The candidate completed the session with a score of ${interview.totalScore}/100.`,
        toneFeedback: "Communication was evaluated with a deterministic fallback because the AI service was rate-limited.",
        strongTopics,
        weakTopics,
        studyPlan: [
          {
            topic: nextInterviewTopic,
            whatToStudy: `Review ${nextInterviewTopic} and practice explaining it with examples.`,
            priority: "high",
          },
        ],
        nextInterviewTopic,
        estimatedReadiness: interview.totalScore >= 75 ? "Ready for advanced rounds" : interview.totalScore >= 60 ? "Close to ready" : "Needs more preparation",
        topicWiseScore: {
          conceptual: Math.min(10, Math.max(1, Math.round(interview.totalScore / 12))),
          coding: Math.min(10, Math.max(1, Math.round(interview.totalScore / 12))),
          communication: Math.min(10, Math.max(1, Math.round(interview.totalScore / 14))),
          complexity: Math.min(10, Math.max(1, Math.round(interview.totalScore / 13))),
          confidence: Math.min(10, Math.max(1, Math.round(interview.totalScore / 14))),
        },
      };
    }

    // calculate grade
    const score = interview.totalScore;
    let grade = "F";
    if (score >= 90) grade = "A";
    else if (score >= 75) grade = "B";
    else if (score >= 60) grade = "C";
    else if (score >= 45) grade = "D";

    // save report to DB
    const report = await Report.create({
      userId: req.userId,
      interviewId: interview._id,
      overallScore: interview.totalScore,
      isPassed: interview.totalScore >= 60,
      grade,
      performanceSummary: parsed.performanceSummary,
      toneFeedback: parsed.toneFeedback,
      strongTopics: parsed.strongTopics,
      weakTopics: parsed.weakTopics,
      studyPlan: parsed.studyPlan,
      nextInterviewTopic: parsed.nextInterviewTopic,
      topicWiseScore: parsed.topicWiseScore,
      estimatedReadiness: parsed.estimatedReadiness,
      generatedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Report generated successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get report by interviewId

export const getReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      interviewId: req.params.interviewId,
    }).populate("interviewId", "topic difficulty totalScore duration");

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    if (report.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get all reports of user

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate("interviewId", "topic difficulty totalScore duration");

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
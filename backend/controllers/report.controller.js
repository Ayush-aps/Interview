import Report from "../models/report.model.js";
import Interview from "../models/interview.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Call Gemini AI

const callAI = async (prompt) => {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
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

    // build report prompt
    const reportPrompt = `
You are IntervueX, an expert interview coach.
Analyze this ${interview.topic} interview conversation and generate a detailed report.

Interview topic: ${interview.topic}
Difficulty: ${interview.difficulty}
Total Score: ${interview.totalScore}/100

Full Interview Conversation:
${conversation}

Per Question Scores:
${interview.questionFeedbacks
        .map((f, i) => `Q${i + 1}: ${f.score}/10`)
        .join("\n")}

Generate a detailed report in EXACTLY this format:
[SUMMARY]: <2-3 line overall performance summary, be specific and honest>
[TONE]: <how the candidate communicated, were they clear and confident>
[STRONG]: <topics or skills they did well, comma separated>
[WEAK]: <topics or skills they struggled with, comma separated>
[STUDY]: <specific topics to study next, comma separated>
[NEXT]: <which topic should they practice next and why, one line>
`;

    // call AI
    const aiResponse = await callAI(reportPrompt);

    // parse AI response
    const parsed = parseReportResponse(aiResponse);

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
import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractText } from "unpdf"; 

// Call Gemini AI 

const callAI = async (messages) => {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
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
    const { topic, difficulty, type, resumeUrl, duration } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ success: false, message: "Server is missing Gemini API Key." });
    }

    let extractedResumeText = "";
    if (resumeUrl) {
      try {
        const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' });
        
        const buffer = new Uint8Array(response.data);
        const parsedData = await extractText(buffer);
        
        if (typeof parsedData === 'string') {
          extractedResumeText = parsedData;
        } else if (parsedData && typeof parsedData.text === 'string') {
          extractedResumeText = parsedData.text;
        } else if (parsedData && Array.isArray(parsedData.text)) {
          extractedResumeText = parsedData.text.join(" ");
        } else {
          extractedResumeText = String(parsedData || "");
        }
        
      } catch (err) {
        console.error("[Backend Error] Could not parse resume PDF:", err.message);
        extractedResumeText = "";
      }
    } else {
    }

    // Build Prompt with Resume Text
    const systemPrompt = buildSystemPrompt(
      topic,
      difficulty || "medium",
      user.name,
      type || "text",
      extractedResumeText,
      duration 
    );
    
    const aiResponse = await callAI([
      { role: "system", content: systemPrompt },
    ]);

    // Save to MongoDB
    const interview = await Interview.create({
      userId: req.userId,
      topic,
      type: type || "text",
      difficulty: difficulty || "medium",
      duration: duration || 30, 
      status: "ongoing",
      messages: [
        {
          role: "ai",
          content: aiResponse,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Interview started",
      interviewId: interview._id,
      aiMessage: aiResponse,
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
    const interview = await Interview.findById(req.params.id);

    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    if (interview.userId.toString() !== req.userId) return res.status(403).json({ success: false, message: "Not allowed" });
    if (interview.status !== "ongoing") return res.status(400).json({ success: false, message: "Interview is already completed or abandoned" });

    const user = await User.findById(req.userId);

    let contentForAI = userMessage || "";
    if (codeSubmitted) {
      contentForAI += `\n\n[CANDIDATE CODE - ${languageUsed}]:\n${codeSubmitted}`;
    }

    interview.messages.push({
      role: "user",
      content: contentForAI,
    });

    const conversationHistory = [
      {
        role: "system",
        content: buildSystemPrompt(interview.topic, interview.difficulty, user.name, interview.type, "", interview.duration), 
      },
      ...interview.messages.map((msg) => ({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.content,
      })),
    ];

    const aiResponse = await callAI(conversationHistory);

    const questionScore = parseScore(aiResponse);
    const timeComplexity = parseTimeComplexity(aiResponse);
    const spaceComplexity = parseSpaceComplexity(aiResponse);

    interview.questionFeedbacks.push({
      question: interview.messages[interview.messages.length - 2]?.content || "",
      userAnswer: userMessage || "",
      codeSubmitted: codeSubmitted || "",
      languageUsed: languageUsed || "javascript",
      timeComplexity,
      spaceComplexity,
      aiFeedback: aiResponse,
      score: questionScore,
    });

    interview.messages.push({
      role: "ai",
      content: aiResponse,
    });

    await interview.save();

    res.json({
      success: true,
      aiMessage: aiResponse,
      questionScore,
      timeComplexity,
      spaceComplexity
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Complete interview

export const completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    if (interview.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const feedbacks = interview.questionFeedbacks;
    const totalScore =
      feedbacks.length > 0
        ? Math.round(
            (feedbacks.reduce((sum, f) => sum + f.score, 0) /
              (feedbacks.length * 10)) *
              100
          )
        : 0;

    const summaryPrompt = [
      {
        role: "system",
        content: `You are IntervueX. The interview for ${interview.topic} is now complete.
        Based on the conversation, give a final summary in this format:
        [SUMMARY]: <2-3 line overall performance summary>
        [STRONG]: <topics they were good at, comma separated>
        [WEAK]: <topics they struggled with, comma separated>
        [ADVICE]: <one actionable tip to improve>`,
      },
      ...interview.messages.map((msg) => ({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.content,
      })),
    ];

    const finalSummary = await callAI(summaryPrompt);

    interview.status = "completed";
    interview.totalScore = totalScore;
    interview.completedAt = new Date();
    interview.messages.push({
      role: "ai",
      content: finalSummary,
    });

    await interview.save();

    await User.findByIdAndUpdate(req.userId, {
      $inc: {
        totalInterviews: 1,
        totalScore: totalScore,
      },
      lastActiveDate: new Date(),
    });

    res.json({
      success: true,
      message: "Interview completed",
      totalScore,
      finalSummary,
      isPassed: interview.isPassed,
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

    const languageMap = {
      63: { language: 'nodejs', versionIndex: '4' },
      71: { language: 'python3', versionIndex: '4' },
      62: { language: 'java', versionIndex: '4' },
      54: { language: 'cpp', versionIndex: '5' }
    };

    const numericId = parseInt(languageId) || 63;
    const selectedLang = languageMap[numericId] || languageMap[63];


    const response = await axios.post('https://api.jdoodle.com/v1/execute', {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: sourceCode || "",
      language: selectedLang.language,
      versionIndex: selectedLang.versionIndex
    });

    const output = response.data.output;
    res.status(200).json({ output: output || "Execution completed with no output." });

  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message;
    console.error("JDoodle API Error:", errorMessage);
    res.status(200).json({ 
      output: `❌ Compiler Error: ${errorMessage}\nPlease check your code or JDoodle limits.` 
    });
  }
};
import Resume from "../models/resume.model.js";
import cloudinary from "../utils/cloudinary.js";
// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// import pdfParse from "pdf-parse";
import { extractText } from "unpdf";
import callAI from "../utils/callAI.js";


// const require = createRequire(import.meta.url);
// const pdfParse = require("pdf-parse");


// Upload buffer to Cloudinary

const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",  // raw = non image files like PDF
        folder: "intervuex/resumes",
        public_id: filename,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};



//  Extract text from PDF buffer

const extractTextFromPDF = async (buffer) => {
  try {
    const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
    return text;
  } catch (error) {
    console.error("PDF Parse Error:", error.message);
    throw error;
  }
};


// Parse resume with AI 
const parseResumeWithAI = async (rawText) => {
  const prompt = `
You are an expert Technical Recruiter and ATS system. Extract information from this resume and provide a brutal, honest gap analysis.
Respond in EXACTLY this JSON format, nothing else, no extra markdown text:

{
  "skills": ["skill1", "skill2"],
  "projects": [
    {
      "name": "project name",
      "description": "what the project does",
      "techStack": ["tech1", "tech2"],
      "githubLink": "",
      "liveLink": ""
    }
  ],
  "experience": [
    {
      "company": "company name",
      "role": "role name",
      "duration": "June 2024 - Aug 2024",
      "description": "what they did"
    }
  ],
  "education": {
    "college": "college name",
    "degree": "B.Tech CSE",
    "graduationYear": 2025
  },
  "candidateSummary": "one line summary of the candidate",
  "atsScore": 75,
  "roleMatch": "Frontend Developer | Backend Developer | Fullstack | Data Scientist",
  "strengths": ["strong react", "good db design"],
  "weaknesses": ["missing cloud deployment", "no CI/CD"],
  "feedback": "2-3 sentences of harsh but constructive feedback on how to pass a FAANG resume screen.",
  "predictedQuestions": ["Can you explain your system design in project X?", "How does React fiber work?"]
}

Resume text:
${rawText}
`;

  const aiResponse = await callAI(prompt);

  // clean response and parse JSON securely
  const cleaned = aiResponse
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
};


// Upload and parse resume

export const uploadResume = async (req, res) => {
  try {
    // check if file exists
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload a PDF file" });
    }

    const file = req.file;
    const userId = req.userId;

    // check if user already has a resume
    // if yes we update it, if no we create new
    let resume = await Resume.findOne({ userId });

    if (!resume) {
      resume = new Resume({ userId });
    }

    // update status to parsing
    resume.status = "parsing";
    resume.originalFileName = file.originalname;
    resume.fileSize = file.size;
    await resume.save();

    // upload PDF to cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      file.buffer,
      `resume_${userId}_${Date.now()}`
    );

    // extract text from PDF
    const rawText = await extractTextFromPDF(file.buffer);

    if (!rawText || rawText.trim().length < 50) {
      resume.status = "failed";
      resume.errorMessage = "Could not extract text from PDF. Try a different file.";
      await resume.save();
      return res.status(400).json({
        success: false,
        message: "Could not read PDF. Make sure it is not a scanned image.",
      });
    }

    // parse resume with AI
    const parsedData = await parseResumeWithAI(rawText);

    // save everything to DB
    resume.filePath    = cloudinaryResult.secure_url;
    resume.rawText     = rawText;
    resume.parsedData  = parsedData;
    resume.status      = "parsed";
    resume.parsedAt    = new Date();
    resume.errorMessage = "";

    await resume.save();

    res.status(200).json({
      success: true,
      message: "Resume uploaded and parsed successfully",
      resume: {
        _id:            resume._id,
        originalFileName: resume.originalFileName,
        filePath:       resume.filePath,
        parsedData:     resume.parsedData,
        status:         resume.status,
        parsedAt:       resume.parsedAt,
      },
    });
  } catch (error) {
    // if anything fails update status to failed
    await Resume.findOneAndUpdate(
      { userId: req.userId },
      { status: "failed", errorMessage: error.message }
    );
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get resume of logged in user

export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.userId });

    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "No resume found. Please upload one." });
    }

    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Delete resume

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.userId });

    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "No resume found" });
    }

    // delete from cloudinary if file exists
    if (resume.filePath) {
      // extract public_id from cloudinary URL
      const publicId = `intervuex/resumes/${resume.filePath
        .split("/")
        .pop()
        .split(".")[0]}`;

      await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw",
      });
    }

    await Resume.deleteOne({ userId: req.userId });

    res.json({ success: true, message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
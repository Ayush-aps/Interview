import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;


// Single project from resume 
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ""       
  },
  description: {
    type: String,
    default: ""       
  },
  techStack: {
    type: [String],
    default: []       
  },
  githubLink: {
    type: String,
    default: ""
  },
  liveLink: {
    type: String,
    default: ""
  }
}, { _id: false });


const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    default: ""      
  },

  role: {
    type: String,
    default: ""      
  },

  duration: {
    type: String,
    default: ""       
  },

  description: {
    type: String,
    default: ""       
  }
}, { _id: false });


// Main resume schema
const resumeSchema = new mongoose.Schema({

  userId: {
    type: ObjectId,
    ref: "User",
    required: true,
    unique: true      
  },

  // File info 
  originalFileName: {
    type: String,
    default: ""       // "rohit_kumar_resume.pdf"
  },

  filePath: {
    type: String,
    default: ""       // where multer saved it on server
  },

  fileSize: {
    type: Number,
    default: 0        // in bytes
  },

  // Raw text extracted from PDF
  rawText: {
    type: String,
    default: ""      
  },

  // AI parsed data
  parsedData: {

    skills: {
      type: [String],
      default: []     
    },

    projects: {
      type: [projectSchema],
      default: []
    },

    experience: {
      type: [experienceSchema],
      default: []
    },

    education: {
      college: { type: String, default: "" },
      degree: { type: String, default: "" },
      graduationYear: { type: Number, default: null }
    },


    candidateSummary: {
      type: String,
      default: ""     
                      
    },

    atsScore: { type: Number, default: 0 },
    roleMatch: { type: String, default: "" },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] }, 
    feedback: { type: String, default: "" },
    predictedQuestions: { type: [String], default: [] }

  },

  // Parsing status
  status: {
    type: String,
    enum: ["uploaded", "parsing", "parsed", "failed"],
    default: "uploaded"
  },

  errorMessage: {
    type: String,
    default: ""       
  },

  // When was it parsed
  parsedAt: {
    type: Date,
    default: null
  }

}, { timestamps: true });


const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;
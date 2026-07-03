import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

// Single message in the interview chat 
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["ai", "user"],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });  

// Per question score + feedback 
const questionFeedbackSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    default: ""
  },
  questionType: {
    type: String,
    default: "conceptual"
  },
  plannerAction: {
    type: String,
    default: "ask_conceptual_question"
  },
  difficultyBefore: {
    type: String,
    default: "medium"
  },
  difficultyAfter: {
    type: String,
    default: "medium"
  },
  userAnswer: {
    type: String,
    default: ""
  },

  codeSubmitted: {
    type: String,
    default: ""
  },
  languageUsed: {
    type: String,
    default: "javascript"
  },
  timeComplexity: {
    type: String,
    default: "" 
  },
  spaceComplexity: {
    type: String,
    default: "" 
  },
  

  aiFeedback: {
    type: String,
    default: ""
  },
  score: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  }
}, { _id: false });

//  Main interview schema
const interviewSchema = new mongoose.Schema({

  // Who took this interview
  userId: {
    type: ObjectId,
    ref: "User",
    required: true
  },

  // What kind of interview
  topic: {
    type: String,
    // enum: [
    //   "dsa",
    //   "javascript",
    //   "react",
    //   "nodejs",
    //   "system-design",
    //   "hr",
    //   "css",
    //   "typescript",
    //   "other"
    // ],
    required: true
  },

  type: {
    type: String,
    enum: ["text", "coding", "mixed"],
    default: "text"
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },

  // Full chat history 
  messages: {
    type: [messageSchema],
    default: []
  },

  // Per question breakdown 
  questionFeedbacks: {
    type: [questionFeedbackSchema],
    default: []
  },

 
  totalScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  isPassed: {
    type: Boolean,
    default: false    // true if totalScore >= 60
  },

  // REPORT CARD SUMMARY
  overallFeedback: {
    type: String,
    default: ""       
  },

  status: {
    type: String,
    enum: ["ongoing", "completed", "abandoned"],
    default: "ongoing"
  },

  // Time tracking 
  startedAt: {
    type: Date,
    default: Date.now
  },

  completedAt: {
    type: Date,
    default: null
  },

  duration: {
    type: Number,  
    default: null
  },

  agentState: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }

}, { timestamps: true });


// Auto calculate duration on complete 
interviewSchema.pre("save", function () {
  if (this.status === "completed" && this.startedAt && this.completedAt) {
    const diff = this.completedAt - this.startedAt;
    this.duration = Math.round(diff / 60000);  
  }
});

// Auto set isPassed 
interviewSchema.pre("save", function () {
  if (this.totalScore >= 60) {
    this.isPassed = true;
  }
});

// Virtual: question count
interviewSchema.virtual("totalQuestions").get(function () {
  return this.questionFeedbacks.length;
});

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
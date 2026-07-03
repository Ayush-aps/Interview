import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;


// Study plan per topic 
const studyPlanSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true    
  },
  whatToStudy: {
    type: String,
    required: true   
  },
  resources: {
    type: [String],   
    default: []
  },
  priority: {
    type: String,
    enum: ["high", "medium", "low"],
    default: "medium"
  }
}, { _id: false });


// Main report schema
const reportSchema = new mongoose.Schema({

  userId: {
    type: ObjectId,
    ref: "User",
    required: true
  },

  interviewId: {
    type: ObjectId,
    ref: "Interview",
    required: true,
    unique: true     
  },

  // Overall result
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },

  isPassed: {
    type: Boolean,
    default: false    // true if overallScore >= 60
  },

  grade: {
    type: String,
    enum: ["A", "B", "C", "D", "F"],
    default: "F"
    // A = 90+, B = 75+, C = 60+, D = 45+, F = below 45
  },

  // AI written summary
  performanceSummary: {
    type: String,    
    default: ""       
  },

  toneFeedback: {
    type: String,     
    default: ""       
  },


  strongTopics: {
    type: [String],   
    default: []
  },

  weakTopics: {
    type: [String],  
    default: []
  },

  studyPlan: {
    type: [studyPlanSchema],
    default: []
  },

  nextInterviewTopic: {
    type: String,     
    default: ""
  },

  topicWiseScore: {
    conceptual: { type: Number, default: 0 },
    coding: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    complexity: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
  },

  estimatedReadiness: {
    type: String,
    default: ""
  },


  improvedFrom: {
    type: Number,     
    default: null    
  },


  generatedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });


// Auto set grade 
reportSchema.pre("save", function () {
  const score = this.overallScore;

  if (score >= 90) this.grade = "A";
  else if (score >= 75) this.grade = "B";
  else if (score >= 60) this.grade = "C";
  else if (score >= 45) this.grade = "D";
  else this.grade = "F";

  this.isPassed = score >= 60;

  // next();
});


const Report = mongoose.model("Report", reportSchema);
export default Report;
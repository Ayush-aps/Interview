import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({

  // Basic info 
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: function () {
      // If they have a googleId, they don't need a password!
      return !this.googleId;
    },
    minlength: 6
  },

  avatar: {
    type: String,
    default: ""
  },

  // Public profile 
  username: {
    type: String,
    unique: true,
    sparse: true,    
    lowercase: true,
    trim: true
  },

  bio: {
    type: String,
    default: ""
  },

  location: {          
    type: String,
    default: ""
  },

  github: {            
    type: String,
    default: ""
  },

  linkedin: {          
    type: String,
    default: ""
  },

  twitter: {           
    type: String,
    default: ""
  },

  portfolio: {         
    type: String,
    default: ""
  },

  isPublic: {
    type: Boolean,
    default: true
  },

  college: {
    type: String,
    default: ""
  },

  graduationYear: {
    type: Number,
    default: null
  },

  targetRole: {
    type: String,
    enum: ["frontend", "backend", "fullstack", "devops", "data", "other"],
    default: "fullstack"
  },

  targetCompanies: {
    type: [String],   
    default: []
  },
  experience: {
    type: String,     
    default: ""
  },
  industry: {
    type: String,     
    default: ""
  },
  techStack: {
    type: [String],   
    default: []
  },
  resumeFile: {
    type: String,     
    default: ""
  },

  // ── Auth ─────────────────────────────────────
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  currentStreak: {
    type: Number,
    default: 0
  },

  longestStreak: {
    type: Number,
    default: 0
  },

  lastActiveDate: {
    type: Date,
    default: null
  },


  totalInterviews: {
    type: Number,
    default: 0
  },

  totalScore: {
    type: Number,
    default: 0       
  },

}, { timestamps: true });  


// Hash password before saving 
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});


// Compare password on login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


userSchema.virtual("averageScore").get(function () {
  if (this.totalInterviews === 0) return 0;
  return Math.round(this.totalScore / this.totalInterviews);
});


const User = mongoose.model("User", userSchema);
export default User;
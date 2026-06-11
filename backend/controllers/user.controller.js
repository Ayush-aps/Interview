import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';
import { OAuth2Client } from 'google-auth-library'; 


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT 

const generateToken = (userId) => {
  // Ensure the payload matches what your middleware expects (userId)
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Auth Controllers


// Authenticate with Google

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential token is missing.' });
    }

    // Verify the Google ID Token securely
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // 2. Check if user already exists in MongoDB
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // Create a brand new user using your Mongoose schema
      user = await User.create({
        name,
        email,
        avatar: picture || '',
        googleId,
        username: email.split('@')[0] + Math.floor(1000 + Math.random() * 9000),
      });
    } else if (!user.googleId) {
      // Link Google ID if they previously signed up with standard email
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    // Send exact same response format as your loginUser controller
    res.status(200).json({
      success: true,
      message: 'Google Authentication successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        targetRole: user.targetRole,
      },
      token: generateToken(user._id), 
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed. Try again.' });
  }
};



// Register a new user

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Authenticate a user & get token (Login)

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Uses the matchPassword method from your User model
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          targetRole: user.targetRole,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Private Profile Controllers ───────────────

// Get logged in user profile

export const getMyProfile = async (req, res) => {
  try {
    // req.userId comes from protect middleware
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    let dynamicRank = 0; 

    if (user.totalInterviews > 0) {
      // Fetch all users who have given at least 1 interview
      const allActiveUsers = await User.find({ totalInterviews: { $gt: 0 } });

      // Sort by average score (Highest average score is 1st)
      const sortedUsers = allActiveUsers.sort((a, b) => {
        const avgA = Math.round(a.totalScore / a.totalInterviews);
        const avgB = Math.round(b.totalScore / b.totalInterviews);
        return avgB - avgA; // Sorts descending
      });

      // Find exactly where user is in this sorted list
      const rankIndex = sortedUsers.findIndex((u) => u._id.toString() === user._id.toString());
      dynamicRank = rankIndex !== -1 ? rankIndex + 1 : 0;
    }

    // Send the user data AND their newly calculated dynamicRank!
    res.json({ success: true, user, globalRank: dynamicRank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user profile

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user) {
      // Basic Info & Identity 
      user.name = req.body.name || user.name;
      user.username = req.body.username || user.username;
      user.avatar = req.body.avatar || user.avatar;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;

      // Location & Social Links
      user.location = req.body.location || user.location;
      user.github = req.body.github || user.github;
      user.linkedin = req.body.linkedin || user.linkedin;
      user.twitter = req.body.twitter || user.twitter;
      user.portfolio = req.body.portfolio || user.portfolio;

      // Placement Info
      user.college = req.body.college || user.college;
      user.graduationYear = req.body.graduationYear || user.graduationYear;
      user.targetRole = req.body.targetRole || user.targetRole;
      user.experience = req.body.experience || user.experience;
      user.industry = req.body.industry || user.industry;
      user.resumeFile = req.body.resumeFile || user.resumeFile;
      if (req.body.techStack) user.techStack = req.body.techStack;

      if (req.body.targetCompanies) {
        user.targetCompanies = req.body.targetCompanies;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (user && (await user.matchPassword(oldPassword))) {
      // The .pre("save") hook in the model will hash this automatically!
      user.password = newPassword;
      await user.save();
      res.json({ success: true, message: "Password updated successfully" });
    } else {
      res.status(401).json({ success: false, message: "Incorrect old password" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user account

export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user) {
      await User.deleteOne({ _id: user._id });
      res.json({ success: true, message: "Account deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Public Profile Controllers ────────────────

// Get user profile by _id
export const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "undefined" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }

    const user = await User.findById(id).select(
      "name username bio avatar location college graduationYear targetRole targetCompanies github linkedin twitter portfolio experience industry techStack totalInterviews totalScore resumeFile"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    let averageScore = 0;
    if (user.totalInterviews > 0 && user.totalScore > 0) {
      averageScore = Math.round(user.totalScore / user.totalInterviews);
    }

    const allUsers = await User.find().select("_id totalScore totalInterviews");

    // Calculate average for everyone
    const rankedUsers = allUsers.map(u => {
      let avg = 0;
      if (u.totalInterviews > 0 && u.totalScore > 0) {
        avg = Math.round(u.totalScore / u.totalInterviews);
      } else if (u.totalScore > 0) {
        avg = u.totalScore;
      }
      return { id: u._id.toString(), avgScore: avg };
    });

    // Sort highest to lowest
    rankedUsers.sort((a, b) => b.avgScore - a.avgScore);

    // Find where current user sits in this sorted list
    const trueRankIndex = rankedUsers.findIndex(u => u.id === user._id.toString());
    const globalRank = trueRankIndex !== -1 ? trueRankIndex + 1 : 0;

    res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        averageScore,
        globalRank
      }
    });
  } catch (error) {
    console.error("Public Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching profile" });
  }
};

// Logout user / clear cookie / clear localStorage

export const logoutUser = async (req, res) => {
  try {
    // If start using cookies later, this wipes the cookie out instantly
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0), 
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Get top users for leaderboard

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({ isPublic: true, totalInterviews: { $gt: 0 } })
      .sort({ totalScore: -1, longestStreak: -1 })
      .select("name username avatar targetRole totalInterviews totalScore longestStreak")
      .limit(50);

    const formattedLeaderboard = leaderboard.map(user => {
      // Now user.totalScore actually exists, so the math works!
      const avg = user.totalInterviews > 0 ? Math.round(user.totalScore / user.totalInterviews) : 0;
      return {
        ...user._doc,
        averageScore: avg
      }
    });

    formattedLeaderboard.sort((a, b) => b.averageScore - a.averageScore);

    res.json({ success: true, leaderboard: formattedLeaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload Logic Function

export const uploadProfileFile = async (req, res) => {
  try {
    // req.file multer se aayega 
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    // Buffer ko base64 mein convert karke Cloudinary par bhejenge
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Cloudinary upload
    const cldRes = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto", // Automatically detects if it's image or PDF
      folder: "intervuex_profiles"
    });

    // Secure URL mil gaya
    res.status(200).json({ success: true, url: cldRes.secure_url });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ success: false, message: "Backend Upload Failed" });
  }
};
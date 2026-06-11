import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMyProfile,
  updateProfile,
  getPublicProfile,
  changePassword,
  deleteAccount,
  getLeaderboard,
  uploadProfileFile,
  googleAuth
} from "../controllers/user.controller.js";
import protect from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();


// const upload = multer({ storage: multer.memoryStorage() });

router.get("/public/:id", getPublicProfile);

// Auth routes
router.post("/register", registerUser);

router.post("/login", loginUser);

router.post('/google', googleAuth);

router.post("/logout", logoutUser);


// Private routes (need token)
router.get("/profile", protect, getMyProfile);

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);

router.delete("/delete", protect, deleteAccount);


router.get("/leaderboard", protect, getLeaderboard);


router.post("/upload", protect, upload.single("file"), uploadProfileFile);


export default router;
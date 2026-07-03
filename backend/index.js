import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import interviewRoute from "./routes/interview.route.js";
import reportRoute from "./routes/report.route.js";
import resumeRoute from "./routes/resume.route.js";


// dotenv.config({});


const app = express();

const PORT = process.env.PORT || 3000;


const _dirname = path.resolve();


// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const corsOptions = {
    origin: [
      process.env.CLIENT_URL,
      "https://intervuex-paxn.onrender.com",
      "http://localhost:5173",
      "http://localhost:3000"
    ].filter(Boolean),
    credentials:true
}

app.use(cors(corsOptions));


// app.get("/", (req, res) => {
//   res.send("PrepAI Backend Running 🚀");
// });

// routes
app.use("/api/user", userRoute);
app.use("/api/interview", interviewRoute);
app.use("/api/report", reportRoute);
app.use("/api/resume", resumeRoute);



app.use(express.static(path.join(_dirname , "/frontend/dist")));
app.get(/.*/,(_, res) => {
  res.sendFile(path.join(_dirname, "frontend", "dist", "index.html"));
});



app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
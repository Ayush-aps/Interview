# IntervueX 🚀

## An AI-Powered Interview Platform

IntervueX is a full-stack mock interview platform that combines AI interview flows with a modern web app experience. It includes a role-aware conversational interviewer, a live code editor with JDoodle execution, resume-based interview setup, and performance reports with complexity analysis and improvement suggestions.

🌐 **Live Website:** [https://interview-backend-elqq.onrender.com/]

🎥 **Demo Video:** [https://drive.google.com/file/d/1JKHLfKxKmr-XKn91Mq9XKHVCgm5gaLHe/view]

---

## ✨ Features

### Real-Time AI Interviewer
- Powered by **Google Gemini 2.5 Flash**
- Uses a role-aware interview planner for frontend, backend, fullstack, data/ML, Java, Python, and SQL sessions
- Conducts dynamic mock interviews with contextual follow-ups
- Keeps the opening, topic selection, and follow-up flow aligned with the chosen role

### Live Code Execution
- Integrated **Monaco Editor** (VS Code Engine)
- Real-time code compilation and execution using **JDoodle API**
- Separate code run and code submit flow for coding interviews
- Supports coding interview simulations

### Bi-Directional Audio & Voice Support
- Browser **SpeechRecognition API** for capturing candidate responses
- Browser **SpeechSynthesis API** for AI voice output
- Interactive animated AI avatar for enhanced user engagement

### Deep-Dive Performance Reports
- Big-O Time Complexity Analysis
- Space Complexity Analysis
- Topic-wise strengths and weaknesses
- Personalized study recommendations
- Role-specific feedback based on the selected interview track

### Customizable Interview Sessions
- Frontend, Backend, Fullstack, Data/ML, Java, Python, and SQL interview sessions
- Multiple difficulty levels
- Text and Coding interview modes
- Resume-based and custom topic-based setup

### Secure Authentication
- JWT Authentication
- Google OAuth Integration
- Protected Routes and Secure Sessions

### Hardware Calibration Room
- Camera permission verification
- Microphone permission verification
- Device readiness checks before interviews
  
### AI Resume Analyzer
- Upload resumes in PDF format
- Generates ATS compatibility score
- Highlights strengths and weaknesses
- Identifies missing skills and keywords
- Suggests improvements for better shortlisting
- Generates role-specific interview questions based on resume content
  
### Competitive Leaderboard
- Global leaderboard based on average interview performance
- Compare scores with other candidates
- Track ranking improvements over time
- Encourages consistent interview practice and skill development
---

## 🧭 Flowchart

```mermaid
flowchart TD
	A[Sign Up / Login] --> B[Profile or Custom Setup]
	B --> C[Choose Role, Topic, Difficulty, Duration]
	C --> D[AI Planner Builds Interview State]
	D --> E[Opening Intro + First Question]
	E --> F[Candidate Answers in Chat or Voice]
	F --> G[Optional Code in Monaco Editor]
	G --> H[Run Code with JDoodle]
	H --> I[Submit Code for Evaluation]
	F --> J[AI Evaluates Answer and Updates Memory]
	I --> J
	J --> K[Next Question / Follow-up / Topic Switch]
	K --> L[Complete Interview]
	L --> M[Generate Report]
	M --> N[Dashboard / History / Leaderboard]
```

---

## 🛠️ Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Axios
- React Router DOM
- Monaco Editor

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer
- Cloudinary

### AI & External APIs
- Google Gemini 2.5 Flash API
- JDoodle API
- Google OAuth

---

## 📂 Project Structure

```bash
IntervueX/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── .env
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── .env
│
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`/backend/.env`)

```env
MONGO_URI=your_mongodb_connection_string
PORT=8000
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
CLIENT_URL=http://localhost:5173
JDOODLE_CLIENT_ID=your_jdoodle_client_id
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend (`/frontend/.env`)

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_API_URL=http://localhost:8000
```


---

## 🚀 Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/YourUsername/IntervueX.git
cd IntervueX
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Open in Browser

```bash
http://localhost:5173
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

Feel free to fork this repository and submit a pull request.

---

## 👨‍💻 Author

**Ayush Pratap Singh**

Built with React, Node.js, MongoDB, Gemini AI, JDoodle, and modern web technologies.

---

## ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Sparkles, Settings2, User, Briefcase, Code2, 
  Loader2, ArrowRight, FileText, CheckCircle2, AlertCircle 
} from "lucide-react";


const roleCategories = [
  { id: "frontend", label: "Frontend", icon: "🎨" },
  { id: "backend", label: "Backend", icon: "⚙️" },
  { id: "fullstack", label: "Fullstack", icon: "🌐" },
  { id: "data", label: "Data / ML", icon: "📊" },
];

const topicsByRole = {
  frontend: [
    { value: "react", label: "React.js", desc: "Hooks, state, lifecycle" },
    { value: "javascript", label: "JavaScript", desc: "ES6+, async, closures" },
    { value: "css", label: "CSS & UI", desc: "Layouts, responsiveness" },
  ],
  backend: [
    { value: "nodejs", label: "Node.js", desc: "APIs, streams, events" },
    { value: "system-design", label: "System Design", desc: "Scale, architecture" },
    { value: "java", label: "Java / Spring", desc: "OOP, multithreading" },
  ],
  fullstack: [
    { value: "mern", label: "MERN Stack", desc: "Mongo, Express, React, Node" },
    { value: "nextjs", label: "Next.js", desc: "SSR, routing, fullstack" },
    { value: "dsa", label: "DSA", desc: "Data Structures & Algos" },
  ],
  data: [
    { value: "python", label: "Python", desc: "Pandas, NumPy, scripts" },
    { value: "sql", label: "SQL & DBs", desc: "Queries, indexing, joins" },
    { value: "ml", label: "Machine Learning", desc: "Models, algorithms" },
  ],
};

const difficulties = [
  { value: "easy", label: "Junior", color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.25)", desc: "0–2 yrs exp" },
  { value: "medium", label: "Mid-level", color: "#facc15", bg: "rgba(250,204,21,0.08)", border: "rgba(250,204,21,0.25)", desc: "2–5 yrs exp" },
  { value: "hard", label: "Senior", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", desc: "5+ yrs exp" },
];

const durations = [
  { value: 15, label: "15 min", sub: "Quick screen" },
  { value: 30, label: "30 min", sub: "Standard" },
  { value: 45, label: "45 min", sub: "Deep dive" },
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  
  const [setupMode, setSetupMode] = useState("profile"); // 'profile' or 'custom'
  const [profileData, setProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Custom Mode States
  const [selectedRole, setSelectedRole] = useState("fullstack");
  const [topic, setTopic] = useState("mern");
  
  // Shared States
  const [difficulty, setDifficulty] = useState("medium");
  const [duration, setDuration] = useState(30);
  const [permState, setPermState] = useState("idle"); 
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'https://intervuex-paxn.onrender.com'}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(res.data.user);
        
        if (res.data.user.experience?.toLowerCase().includes("fresher")) setDifficulty("easy");
        if (res.data.user.experience?.includes("5+")) setDifficulty("hard");
        
      } catch (err) {
        console.error("Failed to load profile", err);
        setSetupMode("custom"); 
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setTopic(topicsByRole[roleId][0].value);
  };

  const requestPermissions = async () => {
    setPermState("loading");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermState("granted");
    } catch {
      setPermState("denied");
    }
  };

  const startInterview = async () => {
    setIsStarting(true);
    try {
      const token = localStorage.getItem("token");
      
      const finalTopic = setupMode === "profile" 
        ? `Comprehensive ${profileData?.targetRole || "Software"} Interview (Focus: ${profileData?.techStack?.join(", ") || "General"})`
        : topic;

      const payload = {
        topic: finalTopic,
        difficulty,
        duration,
        setupMode,
        resumeUrl: setupMode === "profile" ? profileData?.resumeFile : null 
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'https://intervuex-paxn.onrender.com'}/api/interview/start`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/interview/${res.data.interviewId}`);
    } catch (err) {
      console.error("Start Interview Error:", err);
      
      const errorMessage = err.response?.data?.message || err.message || "";
      
      if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("GoogleGenerative")) {
        toast.error("AI Engine is experiencing high traffic. Please try starting the interview in a few seconds!", { duration: 5000 });
      } else if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted")) {
        toast.error("Wow, we are getting a lot of traffic! The AI daily limit is maxed out. Please try again tomorrow.", { duration: 5000 });
      } else {
        toast.error(err.response?.data?.message || "Failed to start interview. Please check your connection.");
      }
      
      setIsStarting(false);
    }
  };

  const selectedDiff = difficulties.find((d) => d.value === difficulty);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#060810] text-white px-0 py-8 sm:py-12 flex items-start justify-center">
      <style>{`
        .setup-card {
          background: linear-gradient(145deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          border-radius: 24px;
        }
        .mode-toggle {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          padding: 6px;
          display: flex;
          gap: 4px;
        }
        .mode-btn {
          flex: 1;
          padding: 10px 16px;
          border-radius: 100px;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        .mode-btn.active {
          background: #4f46e5;
          color: white;
          box-shadow: 0 4px 15px rgba(79,70,229,0.4);
        }
        .mode-btn.inactive {
          color: rgba(255,255,255,0.5);
        }
        .mode-btn.inactive:hover {
          color: white;
          background: rgba(255,255,255,0.05);
        }
        .selectable-card {
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: rgba(255,255,255,0.02);
        }
        .selectable-card:hover { border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.05); }
        .selectable-card.active {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.1);
          box-shadow: 0 0 20px rgba(99,102,241,0.1);
        }
        .section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 12px;
        }
        .perm-btn {
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.25s ease;
          width: 100%;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
      `}</style>

      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* ── HEADER ── */}
        <div className="mb-8 text-center px-2">
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 rounded-full px-4 py-1.5 text-xs text-indigo-300 font-semibold shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Sparkles size={14} /> Next-Gen AI Interviewer
            </span>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 800, lineHeight: 1.1 }}>
            Configure Your Session
          </h1>
        </div>

        <div className="setup-card p-5 sm:p-8 space-y-8 shadow-2xl">

          <div className="mode-toggle flex-col sm:flex-row">
            <button 
              className={`mode-btn ${setupMode === 'profile' ? 'active' : 'inactive'}`}
              onClick={() => setSetupMode('profile')}
            >
              <User size={16} /> Auto-Calibrated
            </button>
            <button 
              className={`mode-btn ${setupMode === 'custom' ? 'active' : 'inactive'}`}
              onClick={() => setSetupMode('custom')}
            >
              <Settings2 size={16} /> Custom Setup
            </button>
          </div>

          <div className="bg-black/20 border border-white/5 rounded-2xl p-5 sm:p-6 shadow-inner">
            
            {setupMode === "profile" && (
              <div className="animate-in fade-in duration-300">
                {isLoadingProfile ? (
                  <div className="flex flex-col items-center py-8 text-indigo-400">
                    <Loader2 className="animate-spin mb-2" size={24} />
                    <p className="text-sm">Reading your profile & resume...</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-white">
                      <Sparkles size={18} className="text-indigo-400"/> Context Loaded
                    </h3>
                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                      The AI will dynamically construct questions targeting your specific background, tech stack, and uploaded resume.
                    </p>
                    
                    <div className="space-y-3">
                      {profileData?.resumeFile ? (
                        <div className="flex items-start sm:items-center gap-3 bg-emerald-500/10 p-3 sm:p-4 rounded-xl border border-emerald-500/20">
                          <FileText size={20} className="text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-emerald-300 flex items-center gap-1">
                              Resume Attached <CheckCircle2 size={14} />
                            </p>
                            <p className="text-xs text-emerald-400/80 mt-0.5">The AI will grill you on your specific projects & skills.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start sm:items-center gap-3 bg-amber-500/10 p-3 sm:p-4 rounded-xl border border-amber-500/20">
                          <FileText size={20} className="text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-amber-300 flex items-center gap-1">
                              No Resume Found <AlertCircle size={14} />
                            </p>
                            <p className="text-xs text-amber-400/80 mt-0.5">Upload a resume in Profile settings for hyper-personalized interviews.</p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div className="flex items-center gap-3 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5">
                          <Briefcase size={18} className="text-fuchsia-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Target Role</p>
                            <p className="text-sm font-semibold text-slate-200 capitalize truncate">{profileData?.targetRole || "Software Engineer"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5">
                          <User size={18} className="text-blue-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Experience</p>
                            <p className="text-sm font-semibold text-slate-200 truncate">{profileData?.experience || "Not Specified"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5">
                        <Code2 size={18} className="text-sky-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Primary Tech Stack</p>
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            {profileData?.techStack?.length > 0 ? profileData.techStack.join(" • ") : "Algorithms & Data Structures"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {setupMode === "custom" && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <div>
                  <p className="section-label">1. Select Domain</p>
                  <div className="grid grid-cols-2 gap-3">
                    {roleCategories.map((role) => (
                      <div 
                        key={role.id} 
                        onClick={() => handleRoleChange(role.id)}
                        className={`selectable-card flex items-center gap-3 ${selectedRole === role.id ? 'active' : ''}`}
                      >
                        <span className="text-xl sm:text-2xl">{role.icon}</span>
                        <span className="font-semibold text-sm">{role.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="section-label">2. Select Specific Topic</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {topicsByRole[selectedRole].map((t) => (
                      <div
                        key={t.value}
                        onClick={() => setTopic(t.value)}
                        className={`selectable-card ${topic === t.value ? "active" : ""}`}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{t.label}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{t.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            
            {/* Difficulty */}
            <div>
              <p className="section-label">Interview Difficulty</p>
              <div className="flex flex-col sm:flex-row gap-3">
                {difficulties.map((d) => (
                  <div
                    key={d.value}
                    className="selectable-card flex-1 text-center sm:text-left flex sm:block items-center justify-between"
                    onClick={() => setDifficulty(d.value)}
                    style={{
                      borderColor: difficulty === d.value ? d.border : "rgba(255,255,255,0.07)",
                      background: difficulty === d.value ? d.bg : "rgba(255,255,255,0.02)",
                      boxShadow: difficulty === d.value ? `0 0 20px ${d.bg}` : "none",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 15, color: difficulty === d.value ? d.color : "rgba(255,255,255,0.6)" }}>
                      {d.label}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }} className="hidden sm:block">{d.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="section-label">Session Duration</p>
              <div className="flex gap-3">
                {durations.map((d) => (
                  <div
                    key={d.value}
                    className={`selectable-card flex-1 text-center ${duration === d.value ? "active" : ""}`}
                    onClick={() => setDuration(d.value)}
                  >
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{d.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{d.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />

            <div>
              <p className="section-label">System Check</p>
              <button
                className="perm-btn"
                onClick={requestPermissions}
                disabled={permState === "granted"}
                style={{
                  background: permState === "granted" ? "rgba(74,222,128,0.08)" : permState === "denied" ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${permState === "granted" ? "rgba(74,222,128,0.3)" : permState === "denied" ? "rgba(248,113,113,0.3)" : "rgba(255,255,255,0.1)"}`,
                  color: permState === "granted" ? "#4ade80" : permState === "denied" ? "#f87171" : "rgba(255,255,255,0.7)",
                }}
              >
                {permState === "loading" && <Loader2 size={16} className="animate-spin" />}
                {permState === "granted" && "✓ Camera & Mic Ready"}
                {permState === "denied" && "✗ Access Denied"}
                {permState === "idle" && "Allow Camera & Microphone"}
              </button>
            </div>

            <button
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-4 sm:py-5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_12px_40px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base sm:text-lg"
              onClick={startInterview}
              disabled={permState !== "granted" || isStarting}
            >
              {isStarting ? (
                <><Loader2 size={22} className="animate-spin" /> Initializing AI Engine...</>
              ) : (
                <>Begin Interview <ArrowRight size={20} /></>
              )}
            </button>

            {permState !== "granted" && (
              <p className="text-center text-xs text-slate-500 mt-[-16px]">
                Hardware access is required to analyze verbal responses and logic.
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
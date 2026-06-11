import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Trophy, ArrowLeft, CheckCircle, Target, 
  TrendingUp, AlertTriangle, BookOpen, MessageSquare,
  ChevronDown, ChevronUp, Code2, Bot  
} from "lucide-react";

export default function Report() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
 
  const [reportData, setReportData] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQ, setExpandedQ] = useState(null); // Tracks which question is expanded

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const [reportRes, interviewRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/report/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/interview/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setReportData(reportRes.data.report);
        setInterviewData(interviewRes.data.interview);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.response?.data?.message || "Could not load report.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060810] text-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">Fetching AI Analysis...</p>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-[#060810] text-white flex flex-col items-center justify-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <p className="text-xl mb-4">{error || "Report not found."}</p>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const gradeColors = {
    A: "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]",
    B: "text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]",
    C: "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]",
    D: "text-orange-400",
    F: "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#060810] text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group w-fit">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Dashboard
        </button>

        <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
          
          <div className="flex justify-center items-center gap-4 mb-6">
            <Trophy size={32} className={reportData.isPassed ? "text-yellow-500" : "text-gray-500"} />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Interview Result</h1>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16">
            <div className="flex flex-col items-center">
              <span className="text-gray-400 text-sm uppercase tracking-widest mb-2 font-semibold">Total Score</span>
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tighter">
                {reportData.overallScore}<span className="text-3xl text-gray-500">/100</span>
              </span>
            </div>

            <div className="w-px h-24 bg-white/10 hidden sm:block"></div>
            
            <div className="flex flex-col items-center">
              <span className="text-gray-400 text-sm uppercase tracking-widest mb-2 font-semibold">Grade</span>
              <span className={`text-6xl sm:text-7xl font-black ${gradeColors[reportData.grade] || "text-white"}`}>
                {reportData.grade}
              </span>
            </div>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-black/50 backdrop-blur-md">
            <div className={`w-2.5 h-2.5 rounded-full ${reportData.isPassed ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></div>
            <span className="text-sm font-medium">{reportData.isPassed ? "Status: Passed" : "Status: Needs Improvement"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-indigo-400 mb-4">
              <Target size={20} /> Executive Summary
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {reportData.performanceSummary || "No summary available."}
            </p>
          </div>

          <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-purple-400 mb-4">
              <MessageSquare size={20} /> Communication & Tone
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {reportData.toneFeedback || "No tone feedback available."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
              <CheckCircle size={18} /> Strong Areas
            </h3>
            <div className="flex flex-wrap gap-2">
              {reportData.strongTopics?.length > 0 ? (
                reportData.strongTopics.map((topic, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-lg text-sm">
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">None identified.</span>
              )}
            </div>
          </div>

          <div className="bg-red-950/10 border border-red-500/20 rounded-2xl p-6">
            <h3 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="rotate-180" /> Needs Work
            </h3>
            <div className="flex flex-wrap gap-2">
              {reportData.weakTopics?.length > 0 ? (
                reportData.weakTopics.map((topic, i) => (
                  <span key={i} className="px-3 py-1 bg-red-500/10 text-red-300 border border-red-500/20 rounded-lg text-sm">
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">None identified.</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#0f111a] border border-white/5 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
            <BookOpen size={24} className="text-indigo-400" /> Actionable Study Plan
          </h2>
          
          <div className="space-y-4">
            {reportData.studyPlan?.length > 0 ? (
              reportData.studyPlan.map((plan, idx) => (
                <div key={idx} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{plan.topic}</h4>
                    <p className="text-sm text-gray-400">{plan.whatToStudy}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No specific study plan generated.</p>
            )}
          </div>

          {reportData.nextInterviewTopic && (
            <div className="mt-8 p-5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
              <p className="text-sm text-indigo-300 font-semibold uppercase tracking-wider mb-1">Recommended Next Step</p>
              <p className="text-white font-medium">{reportData.nextInterviewTopic}</p>
            </div>
          )}
        </div>

        {interviewData && interviewData.questionFeedbacks && interviewData.questionFeedbacks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageSquare size={24} className="text-fuchsia-400" /> Question Breakdown
            </h2>
            <div className="space-y-3">
              {interviewData.questionFeedbacks.map((q, idx) => (
                <div key={idx} className="bg-[#0f111a] border border-white/5 rounded-xl overflow-hidden transition-all">
                  
                  <div 
                    onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1 pr-4">
                      <span className="text-xs font-bold text-indigo-400 mb-1 block uppercase tracking-wider">Question {idx + 1}</span>
                      <h3 className="text-sm font-medium text-gray-200 line-clamp-2">{q.question.replace(/\[.*?\]/g, '')}</h3>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                        q.score >= 8 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        q.score >= 5 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {q.score} / 10
                      </div>
                      {expandedQ === idx ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                    </div>
                  </div>

                  {expandedQ === idx && (
                    <div className="p-6 border-t border-white/5 bg-[#060810] space-y-6 animate-in slide-in-from-top-2 duration-200">
                      
                      {/* User's Spoken/Typed Answer */}
                      {q.userAnswer && (
                        <div>
                          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                            <MessageSquare size={12}/> Your Answer
                          </h4>
                          <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                            {q.userAnswer}
                          </p>
                        </div>
                      )}

                      {/* User's Code (If any) */}
                      {q.codeSubmitted && (
                        <div>
                          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                            <Code2 size={12}/> Code Submitted ({q.languageUsed})
                          </h4>
                          <pre className="text-sm text-indigo-300 font-mono bg-black p-4 rounded-xl border border-white/5 overflow-x-auto">
                            {q.codeSubmitted}
                          </pre>
                          
                          {/* Time & Space Complexity */}
                          {(q.timeComplexity || q.spaceComplexity) && (
                            <div className="flex gap-4 mt-3">
                              {q.timeComplexity && <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20">Time: {q.timeComplexity}</span>}
                              {q.spaceComplexity && <span className="text-xs bg-fuchsia-500/10 text-fuchsia-400 px-2 py-1 rounded border border-fuchsia-500/20">Space: {q.spaceComplexity}</span>}
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Feedback */}
                      <div>
                        <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                          <Bot size={12}/> AI Feedback
                        </h4>
                        <p className="text-sm text-emerald-100/80 leading-relaxed bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                          {q.aiFeedback.replace(/\[.*?\]:.*?(\n|$)/g, '').trim() || "Good attempt."}
                        </p>
                      </div>

                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
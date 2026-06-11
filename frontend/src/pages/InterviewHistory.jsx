import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, Calendar, Award, Code } from "lucide-react";

export default function InterviewHistory() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Har page par 6 interviews dikhenge

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_URL = import.meta.env.VITE_API_URL || 'https://intervuex-paxn.onrender.com';
        
        const res = await axios.get(`${API_URL}/api/report/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setReports(res.data.reports || []);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] w-full flex flex-col items-center justify-center text-indigo-400">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-mono text-xs tracking-wider uppercase">Loading Archive...</p>
      </div>
    );
  }

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reports.length / itemsPerPage);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Interview History</h1>
          <p className="text-xs text-slate-400 mt-0.5">Review and analyze all your past AI evaluation sessions.</p>
        </div>
        <button 
          onClick={() => navigate("/dashboard")} 
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 bg-white/5 rounded-lg border border-white/5"
        >
          <ArrowLeft size={14} /> Dashboard
        </button>
      </div>

      {reports.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-[#0B0F19]/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/60 bg-black/20 text-slate-400 text-xs font-semibold tracking-wider uppercase">
                    <th className="p-4 pl-6">Topic / Role</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                  {currentItems.map((report) => (
                    <tr 
                      key={report._id} 
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => navigate(`/report/${report.interviewId?._id || report.interviewId}`)}
                    >
                      {/* Topic */}
                      <td className="p-4 pl-4 font-bold text-white capitalize flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-md group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                          <Code size={14} />
                        </div>
                        {report.interviewId?.topic || "Technical"}
                      </td>
                      
                      <td className="p-4 text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-600" />
                          {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>

                      <td className="p-4 capitalize font-semibold text-slate-400">
                        {report.interviewId?.difficulty || "Medium"}
                      </td>

                      <td className="p-4 text-center font-black text-white">
                        <span className="inline-flex items-center gap-1">
                          <Award size={14} className="text-yellow-500/70" />
                          {report.overallScore}%
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                          report.isPassed 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {report.isPassed ? "Passed" : "Review"}
                        </span>
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <Link 
                          to={`/report/${report.interviewId?._id || report.interviewId}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all"
                          onClick={(e) => e.stopPropagation()} // Row click trigger bypass karne ke liye
                        >
                          <Eye size={12} /> Report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <p className="text-xs text-slate-500">
                Showing <span className="text-slate-300 font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="text-slate-300 font-medium">{Math.min(indexOfLastItem, reports.length)}</span> of{" "}
                <span className="text-slate-300 font-medium">{reports.length}</span> sessions
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex gap-1 text-xs font-bold">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg border transition-all ${
                        currentPage === i + 1
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                          : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
          <p className="text-slate-400 text-sm italic">You haven't completed any interviews yet.</p>
        </div>
      )}
    </div>
  );
}
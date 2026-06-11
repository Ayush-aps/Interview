import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaUser, FaBriefcase, FaGraduationCap, FaBuilding, 
  FaBullseye, FaTrophy, FaAward, FaMapMarkerAlt, 
  FaGlobe, FaGithub, FaLinkedin, FaTwitter,
  FaCode, FaClock, FaIndustry, FaFilePdf, FaCalendarAlt,
  FaArrowLeft, FaLink
} from "react-icons/fa";
import { Loader2, AlertTriangle } from "lucide-react";

const PublicProfile = () => {
  const { identifier } = useParams(); 
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/user/public/${identifier}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setProfileData(res.data.user);
      } catch (err) {
        setError("User profile not found or set to private.");
      } finally {
        setLoading(false);
      }
    };
    if (identifier) {
      fetchPublicProfile();
    }
  }, [identifier]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060810] flex justify-center items-center text-indigo-400">
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#060810] flex flex-col items-center justify-center text-slate-400 px-4">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
        <p className="mb-6 text-center text-sm max-w-sm text-slate-400">{error}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-semibold shadow-md">
          Go Back
        </button>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#060810] text-slate-200 py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      
      {/* Decorative Radial Background Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        
        {/* Navigation Row */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium group w-fit">
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Leaderboard
        </button>

        <div className="bg-[#0B0F19]/60 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden relative">
          <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 relative">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          </div>
          
          <div className="px-6 sm:px-10 pb-8">
            <div className="relative flex justify-between items-end -mt-16 sm:-mt-20 mb-4">
              <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-[#050810] bg-[#0B0F19] overflow-hidden shadow-2xl flex items-center justify-center shrink-0">
                {profileData?.avatar ? (
                  <img src={profileData.avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <FaUser size={50} className="text-slate-600" />
                )}
              </div>
              
              <div className="flex gap-2 sm:gap-3 mb-2">
                {profileData?.github && (
                  <a href={profileData.github} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#050812] hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all border border-slate-800/80 w-10 h-10 flex items-center justify-center shadow-md">
                    <FaGithub size={18} />
                  </a>
                )}
                {profileData?.linkedin && (
                  <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#050812] hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-full transition-all border border-slate-800/80 w-10 h-10 flex items-center justify-center shadow-md">
                    <FaLinkedin size={18} />
                  </a>
                )}
                {profileData?.twitter && (
                  <a href={profileData.twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#050812] hover:bg-sky-500/20 text-slate-400 hover:text-sky-400 rounded-full transition-all border border-slate-800/80 w-10 h-10 flex items-center justify-center shadow-md">
                    <FaTwitter size={18} />
                  </a>
                )}
                {profileData?.portfolio && (
                  <a href={profileData.portfolio} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#050812] hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-full transition-all border border-slate-800/80 w-10 h-10 flex items-center justify-center shadow-md">
                    <FaGlobe size={18} />
                  </a>
                )}
              </div>
            </div>
            
            <div className="mt-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">{profileData?.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm font-medium flex-wrap">
                <span className="text-indigo-400">@{profileData?.username || "user"}</span>
                {profileData?.location && (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <FaMapMarkerAlt size={14} className="text-slate-500" /> {profileData.location}
                  </span>
                )}
              </div>
              <p className="text-slate-400 mt-4 max-w-2xl text-sm sm:text-base leading-relaxed">
                {profileData?.bio || "This developer hasn't added a biography yet."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-[#0B0F19]/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 flex items-center gap-4 shadow-xl">
            <div className="p-4 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0"><FaBullseye size={24} /></div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Total Interviews</p>
              <p className="text-2xl font-bold text-white mt-0.5">{profileData?.totalInterviews || 0}</p>
            </div>
          </div>
          <div className="bg-[#0B0F19]/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 flex items-center gap-4 shadow-xl">
            <div className="p-4 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0"><FaTrophy size={24} /></div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Average Score</p>
              <p className="text-2xl font-bold text-white mt-0.5">{profileData?.averageScore || 0}/100</p>
            </div>
          </div>
          <div className="bg-[#0B0F19]/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 flex items-center gap-4 shadow-xl">
            <div className="p-4 bg-amber-500/10 rounded-xl text-amber-400 shrink-0"><FaAward size={24} /></div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Global Rank</p>
              <p className="text-2xl font-bold text-white mt-0.5">
                {profileData?.globalRank > 0 ? `#${profileData.globalRank}` : "Unranked"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#0B0F19]/60 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-500 opacity-60" />
          
          <div className="p-6 sm:px-8 border-b border-slate-800/80 bg-[#0A0D16]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaBriefcase size={18} className="text-fuchsia-400" /> Professional Blueprint
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm sm:text-base border-collapse">
              <tbody className="divide-y divide-slate-800/60">
                
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-400 flex items-center gap-3 w-1/3 min-w-[170px]">
                    <FaUser className="text-indigo-400" /> Target Role
                  </td>
                  <td className="py-4 px-6 text-slate-200 capitalize font-medium">
                    {profileData?.targetRole || "—"}
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-400 flex items-center gap-3 w-1/3 min-w-[170px]">
                    <FaClock className="text-orange-400" /> Experience Level
                  </td>
                  <td className="py-4 px-6 text-slate-200 font-medium">
                    {profileData?.experience || "—"}
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-400 flex items-center gap-3 w-1/3 min-w-[170px]">
                    <FaIndustry className="text-teal-400" /> Sector Preference
                  </td>
                  <td className="py-4 px-6 text-slate-200 font-medium">
                    {profileData?.industry || "—"}
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-400 flex items-center gap-3 w-1/3 min-w-[170px]">
                    <FaCode className="text-emerald-400" /> Verified Core Stack
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      {profileData?.techStack?.length > 0 ? (
                        profileData.techStack.map((tech, i) => (
                          <span key={i} className="px-2.5 py-1 bg-[#050812] border border-slate-800 rounded-md text-xs font-semibold text-emerald-300">
                            {tech}
                          </span>
                        ))
                      ) : <span className="text-slate-500 italic text-sm">Not provided</span>}
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-400 flex items-center gap-3 w-1/3 min-w-[170px]">
                    <FaBuilding className="text-blue-400" /> Target Entities
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      {profileData?.targetCompanies?.length > 0 ? (
                        profileData.targetCompanies.map((company, i) => (
                          <span key={i} className="px-2.5 py-1 bg-[#050812] border border-slate-800 rounded-full text-xs font-semibold text-blue-300">
                            {company}
                          </span>
                        ))
                  ) : <span className="text-slate-500 italic text-sm">Not provided</span>}
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-400 flex items-center gap-3 w-1/3 min-w-[170px]">
                    <FaGraduationCap className="text-fuchsia-400" /> Alma Mater
                  </td>
                  <td className="py-4 px-6 text-slate-200 font-medium">
                    {profileData?.college ? (
                      <div>
                        <span>{profileData.college}</span>
                        {profileData?.graduationYear && (
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-mono">
                            <FaCalendarAlt size={11} /> Class of {profileData.graduationYear}
                          </span>
                        )}
                      </div>
                    ) : <span className="text-slate-500 italic text-sm">Not provided</span>}
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-400 flex items-center gap-3 w-1/3 min-w-[170px]">
                    <FaFilePdf className="text-red-400" /> Credentials Document
                  </td>
                  <td className="py-4 px-6">
                    {profileData?.resumeFile ? (
                      <a href={profileData.resumeFile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all text-xs font-bold border border-red-500/20 shadow-sm">
                        <FaLink size={11} /> View Resume Portfolio
                      </a>
                    ) : <span className="text-slate-500 italic text-sm">No resume uploaded</span>}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicProfile;
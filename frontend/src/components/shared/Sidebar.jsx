import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  FileText,
  BarChart,
  Trophy,
  User,
  LogOut
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { Gift } from "lucide-react";
import { API_BASE_URL } from "../../lib/api";



const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "AI Interviews", path: "/dashboard/interview", icon: Bot },
    { name: "Resume Analyzer", path: "/dashboard/resume", icon: FileText },
    { name: "Leaderboard", path: "/dashboard/leaderboard", icon: Trophy },
    { name: "Profile", path: "/dashboard/profile", icon: User },
  ];

  const handleLogout = async () => {
    try {

      await axios.post(`${API_BASE_URL}/api/user/logout`);

    } catch (error) {
      console.error("Logout error:", error.response?.data?.message || error.message);
    } finally {

      toast.success("Logged out successfully. See you next time!");

      localStorage.removeItem("token");

      navigate("/login");
    }
  };


  const handleShare = async () => {
    const shareData = {
      title: "IntervueX - Crack Your Dream Job",
      text: "Bro, check out this AI Interview platform! Practice for companies easily.",
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };


  return (
    <div className="w-64 h-screen bg-[#0B0F19] border-r border-slate-800 flex flex-col justify-between p-4 hidden md:flex text-white">
      <div>
        <Link to="/" className="flex items-center gap-2 px-2 mb-10 mt-2">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            X
          </div>
          <span className="text-xl font-bold tracking-wide">IntervueX</span>
        </Link>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
              >
                <Icon size={20} className={isActive ? "text-indigo-400" : ""} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-4">

        {/* Share Card */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Gift size={16} className="text-yellow-500" />
            <span className="text-sm font-bold text-slate-200">Love IntervueX?</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">Help your friends crack their dream FAANG jobs too.</p>
          <button
            onClick={handleShare} 
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-900/50"
          >
            Share with a Friend
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors w-full"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
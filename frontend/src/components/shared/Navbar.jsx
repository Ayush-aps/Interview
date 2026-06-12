import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, X, LayoutDashboard, Bot, FileText, Trophy, User, LogOut 
} from "lucide-react";
import axios from "axios";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user has a token (logged in)
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post("https://intervuex-paxn.onrender.com/api/user/logout");
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const dashboardLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "AI Interviews", path: "/dashboard/interview", icon: Bot },
    { name: "Resume Analyzer", path: "/dashboard/resume", icon: FileText },
    { name: "Leaderboard", path: "/dashboard/leaderboard", icon: Trophy },
    { name: "Profile", path: "/dashboard/profile", icon: User },
  ];

  return (
    <nav className="w-full px-4 sm:px-8 py-3 lg:py-4 border-b border-slate-800 bg-[#03040B] text-white flex justify-between items-center relative z-50">
      
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(79,70,229,0.5)]">
          X
        </div>
        <span className="text-2xl font-extrabold tracking-wide text-slate-100">IntervueX</span>
      </Link>

      <div className="hidden md:flex gap-4 items-center">
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="px-6 py-2 bg-[#0B0F19]/80 backdrop-blur-sm hover:bg-slate-800/80 border border-slate-800 text-slate-200 font-semibold rounded-xl transition-all duration-300">
              Login
            </Link>
            <Link to="/register" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              Get Started
            </Link>
          </>
        ) : (
          <Link to="/dashboard" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2">
            <LayoutDashboard size={18} /> Go to Dashboard
          </Link>
        )}
      </div>

      <button 
        className="md:hidden text-slate-300 hover:text-white p-2 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[#050812]/95 backdrop-blur-xl border-b border-slate-800 shadow-2xl flex flex-col p-4 md:hidden animate-in slide-in-from-top-2 duration-300">
          
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Menu</span>
              {dashboardLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    <Icon size={20} className={isActive ? "text-indigo-400" : ""} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="h-px w-full bg-slate-800 my-2"></div>
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors w-full text-left"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-2">
              <Link to="/login" className="w-full text-center px-4 py-3.5 bg-[#0B0F19]/60 border border-slate-800 text-slate-200 font-semibold rounded-xl">
                Login
              </Link>
              <Link to="/register" className="w-full text-center px-4 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
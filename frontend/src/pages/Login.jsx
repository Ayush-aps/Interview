import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { GoogleLogin } from '@react-oauth/google'; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Authenticating...");
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("https://intervuex-paxn.onrender.com/api/user/login", formData);
      
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        toast.success("Welcome back, Hacker!", { id: toastId });
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
      const errorMsg = err.response?.data?.message || "Login failed. Try again.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // NEW GOOGLE AUTH HANDLER
  const handleGoogleSuccess = async (credentialResponse) => {
    const toastId = toast.loading("Verifying with Google...");
    try {
      const res = await axios.post("https://intervuex-paxn.onrender.com/api/user/google", {
        credential: credentialResponse.credential,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        toast.success("Welcome back, Hacker!", { id: toastId });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Google Login Error:', error);
      toast.error("Google Sign-In failed. Please try again.", { id: toastId });
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#050810] relative overflow-hidden px-4 py-10">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 translate-x-1/2 w-80 h-80 bg-purple-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0B0F19]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_-12px_rgba(79,70,229,0.25)] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-fuchsia-500/10 rounded-2xl border border-fuchsia-500/20 mb-4 shadow-[0_0_20px_rgba(217,70,239,0.2)]">
            <Sparkles className="text-fuchsia-400" size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-2">Resume your interview preparation.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" name="email" required
                value={formData.email} onChange={handleChange}
                className="w-full bg-[#050812] border border-slate-700/50 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between">
              <span>Password</span>
              {/* <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer capitalize font-semibold tracking-normal">Forgot?</span> */}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" name="password" required
                value={formData.password} onChange={handleChange}
                className="w-full bg-[#050812] border border-slate-700/50 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Access Dashboard"} 
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* NEW GOOGLE BUTTON SECTION */}
        <div className="mt-6">
          <div className="relative flex py-2 items-center w-full mb-4">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google popup closed or failed.')}
              theme="filled_black" // Perfect for your dark mode theme
              shape="pill"
              size="large"
              text="continue_with"
              width="100%"
            />
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
          New to IntervueX? <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
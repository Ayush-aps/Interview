import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, User, ArrowRight, Loader2, Brain } from "lucide-react";
import toast from "react-hot-toast";
import { GoogleLogin } from '@react-oauth/google'; 
import { API_BASE_URL } from "../lib/api";


const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Creating...");
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/register`, formData);
      
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        toast.success("Welcome to IntervueX!", { id: toastId });
        navigate("/dashboard");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
      const errorMsg = err.response?.data?.message || "Registration failed. Try again.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const toastId = toast.loading("Verifying with Google...");
    try {
      const res = await axios.post(`${API_BASE_URL}/api/user/google`, {
        credential: credentialResponse.credential,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        toast.success("Welcome to IntervueX!", { id: toastId });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Google Login Error:', error);
      toast.error("Google Sign-Un failed. Please try again.", { id: toastId });
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#050810] relative overflow-hidden px-4 py-10">
      
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-80 h-80 bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-purple-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0B0F19]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_-12px_rgba(79,70,229,0.25)] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-4 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
            <Brain className="text-indigo-400" size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Initialize Session</h2>
          <p className="text-sm text-slate-400 mt-2">Create your IntervueX profile to begin.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" name="name" required
                value={formData.name} onChange={handleChange}
                className="w-full bg-[#050812] border border-slate-700/50 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                placeholder="John Doe"
              />
            </div>
          </div>

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
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" name="password" required minLength={6}
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
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Account"} 
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

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
          Already have an account? <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
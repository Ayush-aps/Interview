import { Link } from "react-router-dom";
import {
  Brain,
  Code,
  FileText,
  BarChart,
  ChevronRight,
  Star,
  Terminal,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Building2,
  Zap
} from "lucide-react";

const Home = () => {
  // Check if user is logged in
  const token = localStorage.getItem("token");

  return (
    <div className="w-full bg-[#050810] min-h-screen text-slate-200 overflow-x-hidden">

      <section id="home" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-20">

        {/* Futuristic Background Glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-96 h-96 bg-purple-600/10 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-5 space-y-6 text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-700">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Crack Your Dream <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-[0_0_30px_rgba(129,140,248,0.2)]">
                Tech Job with AI
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Al-powered mock interviews, coding rounds, and personalized feedback to help you ace your dream job.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">

              {token ? (
                <Link to="/dashboard" className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_40px_rgba(79,70,229,0.6)] flex items-center justify-center gap-2 tracking-wide transform hover:-translate-y-0.5">
                  Access Dashboard <ChevronRight size={18} />
                </Link>
              ) : (
                <Link to="/register" className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_40px_rgba(79,70,229,0.6)] flex items-center justify-center gap-2 tracking-wide transform hover:-translate-y-0.5">
                  Get Started Now <ChevronRight size={18} />
                </Link>
              )}

              <button className="w-full sm:w-auto px-6 py-3.5 bg-[#0B0F19]/60 backdrop-blur-sm hover:bg-slate-800/80 border border-slate-800 text-slate-200 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                Watch Demo
              </button>
            </div>


            <div className="pt-4 w-full">
  {/* Centered heading on mobile, left-aligned on larger screens */}
  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3 text-center sm:text-left">
    Live Infrastructure
  </p>
  
  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-cyan-500/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
      
      <div className="relative flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700/80 shadow-sm whitespace-nowrap">
        <span className="flex h-2 w-2 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
        </span>
        <span className="text-[11px] sm:text-xs font-bold text-cyan-50 tracking-wide">
          Gemini 2.5 Flash
        </span>
      </div>
    </div>

    <div className="group relative">
      <div className="absolute -inset-0.5 bg-emerald-500/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
      
      <div className="relative flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700/80 shadow-sm whitespace-nowrap">
        <Zap size={13} className="text-emerald-400 fill-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)] shrink-0" />
        <span className="text-[11px] sm:text-xs font-bold text-emerald-50 tracking-wide">
          JDoodle Online
        </span>
      </div>
    </div>
    
  </div>
</div>
          </div>

          <div className="lg:col-span-7 relative w-full lg:h-[480px] mt-8 lg:mt-0 animate-in fade-in slide-in-from-right-8 duration-700">
            {/* The Floating Neon Hologram Brain */}
            <div className="absolute -top-16 left-1/3 z-20 hidden md:block animate-bounce [animation-duration:4s]">
              <div className="relative p-4 bg-indigo-900/10 rounded-full border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.3)] backdrop-blur-md">
                <Brain size={56} className="text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-pulse" />
              </div>
            </div>

            <div className="w-full h-full bg-[#0B0F19]/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="bg-[#050810]/90 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* AI Message */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-1">
                      <Sparkles size={10} /> AI Interviewer
                    </span>
                    <p className="text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                      Can you explain the difference between let, const and var in JavaScript?
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">You</span>
                    <p className="text-xs bg-indigo-600/10 p-2.5 rounded-lg border border-indigo-500/20 text-indigo-200">
                      I think var is function scoped while let and const are block scoped...
                    </p>
                  </div>
                  {/* Real-time AI Feedback Loop */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">AI Feedback</span>
                    <div className="text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <CheckCircle2 size={12} /> Great understanding!
                      </div>
                      <div>• Consider adding examples.</div>
                      <div>• Try to cover hoisting as well.</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-900">
                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Score</span>
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                      85
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#050810]/90 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase flex items-center gap-1">
                    <Terminal size={10} /> Live Coding Environment
                  </span>

                  <div className="font-mono text-[11px] text-slate-300 space-y-1 bg-slate-950/80 p-3 rounded-lg border border-slate-900 leading-normal">
                    <span className="text-purple-400">function</span> <span className="text-blue-400">greet</span>(<span className="text-orange-400">name</span>) &#123;
                    <div className="pl-4 text-slate-400">
                      <span className="text-purple-400">let</span> message = <span className="text-emerald-400">"Hello "</span> + name;
                    </div>
                    <div className="pl-4">
                      <span className="text-purple-400">return</span> message;
                    </div>
                    &#125;
                    <div className="pt-2 text-slate-400">
                      greet(<span className="text-emerald-400">"IntervueX"</span>);
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Test Cases</span>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] px-2 py-1 bg-slate-900/40 border border-slate-900 rounded">
                        <span className="text-slate-400">✓ Test Case 1</span>
                        <span className="text-emerald-400 font-medium text-[10px]">Passed</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] px-2 py-1 bg-slate-900/40 border border-slate-900 rounded">
                        <span className="text-slate-400">✓ Test Case 2</span>
                        <span className="text-emerald-400 font-medium text-[10px]">Passed</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 text-right">
                  MERN Environment Connected
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

          {/* Cards */}
          <div className="bg-[#0B0F19]/40 border border-slate-800 p-4 rounded-xl flex items-start gap-3 hover:border-indigo-500/30 transition-all group">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              <MessageSquare size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">AI Mock Interviews</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Real-time tailored simulation chats.</p>
            </div>
          </div>

          <div className="bg-[#0B0F19]/40 border border-slate-800 p-4 rounded-xl flex items-start gap-3 hover:border-purple-500/30 transition-all group">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
              <Code size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">Coding Arena</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Solve advanced challenges easily.</p>
            </div>
          </div>

          <div className="bg-[#0B0F19]/40 border border-slate-800 p-4 rounded-xl flex items-start gap-3 hover:border-emerald-500/30 transition-all group">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">AI Feedback</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Instant structured metrics loop.</p>
            </div>
          </div>

          <div className="bg-[#0B0F19]/40 border border-slate-800 p-4 rounded-xl flex items-start gap-3 hover:border-pink-500/30 transition-all group">
            <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg group-hover:bg-pink-600 group-hover:text-white transition-colors duration-300">
              <FileText size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">Resume Analyzer</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">PDF parsed profile evaluation.</p>
            </div>
          </div>

          <div className="bg-[#0B0F19]/40 border border-slate-800 p-4 rounded-xl flex items-start gap-3 hover:border-blue-500/30 transition-all group">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <BarChart size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">Leaderboard</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Compete with peers and climb rankings.</p>
            </div>
          </div>

          <div className="bg-[#0B0F19]/40 border border-slate-800 p-4 rounded-xl flex items-start gap-3 hover:border-amber-500/30 transition-all group">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
              <Building2 size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">Dashboard Track</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Track progress and activity.</p>
            </div>
          </div>

        </div>
      </section>

      <section id="about" className="max-w-4xl mx-auto px-4 sm:px-6 text-center py-16 border-t border-slate-900">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Built for the Modern Developer</h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
          IntervueX was engineered to completely eliminate engineering placement anxiety. By connecting custom algorithmic evaluations with next-gen models, we provide an infinitely repeatable, stateful interview environment so you can master technical execution, design logic, and performance analysis long before your first screening call.
        </p>
      </section>

    </div>
  );
};

export default Home;
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layouts
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import GuestRoute from "./components/shared/GuestRoute";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import AIInterview from "./pages/AIInterview";
import InterviewSetup from "./pages/InterviewSetup";
import ResumeAnalyser from "./pages/ResumeAnalyzer";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Report from './pages/Report';
import InterviewHistory from "./pages/InterviewHistory";
import PublicProfile from "./pages/PublicProfile";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          className: '',
          style: {
            background: '#1e293b', 
            color: '#f8fafc',      
            border: '1px solid #334155', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: 999999,
          },
          success: {
            iconTheme: {
              primary: '#10b981', 
              secondary: '#1e293b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', 
              secondary: '#1e293b',
            },
          },
        }}
      />
      <Routes>

        {/* PUBLIC ROUTE FUNNEL */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>

        {/* PROTECTED SAAS DASHBOARD */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="interview" element={<InterviewSetup />} />
            {/* <Route path="interview/:id" element={<AIInterview />} /> */}
            <Route path="history" element={<InterviewHistory />} />
            <Route path="resume" element={<ResumeAnalyser />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="profile" element={<Profile />} />
            {/* <Route path="/report/:id" element={<Report />} /> */}
          </Route>
          <Route path="/interview/:id" element={<AIInterview />} />
            <Route path="/report/:id" element={<Report />} />
            <Route path="profile/:identifier" element={<PublicProfile />} />


        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
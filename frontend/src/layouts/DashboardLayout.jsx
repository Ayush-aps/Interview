import { Outlet } from "react-router-dom";
import Sidebar from "../components/shared/Sidebar";
import Navbar from "../components/shared/Navbar";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-black font-sans flex-col md:flex-row overflow-hidden">
      
      <Sidebar />

      <div className="block md:hidden">
        <Navbar />
      </div>
      
      <main className="flex-1 overflow-y-auto bg-[#03040B] md:p-8 p-4">
        <Outlet />
      </main>

    </div>
  );
};

export default DashboardLayout;
import { Outlet } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <Navbar />
      
      {/* This is where Home, Login, or Register will render */}
      <main className="flex-grow">
        <Outlet /> 
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
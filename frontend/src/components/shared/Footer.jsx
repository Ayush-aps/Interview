import { FaHeart, FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full p-6 border-t border-gray-800 bg-black text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
      
      <div className="flex items-center gap-1.5 font-medium">
        Made with <FaHeart className="text-red-500 text-base animate-pulse" /> by Avi
      </div>

      <div className="text-center font-medium">
        IntervueX. Crack Your Dream Tech Job.
      </div>

      <div className="flex items-center gap-4">
        
        <a 
          href="https://github.com/Abi04nash" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="p-2 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-600 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md"
          aria-label="GitHub"
        >
          <FaGithub className="text-lg" />
        </a>

        <a 
          href="https://www.linkedin.com/in/abinash-mishra-880a5b291/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="p-2 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md"
          aria-label="LinkedIn"
        >
          <FaLinkedin className="text-lg" />
        </a>

        <a 
          href="https://abi04nash.github.io/AviPortfolio/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="p-2 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md"
          aria-label="Portfolio"
        >
          <FaGlobe className="text-lg" />
        </a>

      </div>

    </footer>
  );
};

export default Footer;
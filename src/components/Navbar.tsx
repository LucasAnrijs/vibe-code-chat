
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, Code, BookOpen, Github, Wand2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm py-4 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-vibe-purple font-bold text-xl">VibeCode</Link>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`flex items-center gap-2 text-vibe-dark hover:text-vibe-purple transition-colors ${
              isActive("/") ? "text-vibe-purple font-medium" : ""
            }`}
          >
            <Code size={18} />
            Home
          </Link>
          <Link 
            to="/curriculum" 
            className={`flex items-center gap-2 text-vibe-dark hover:text-vibe-purple transition-colors ${
              isActive("/curriculum") ? "text-vibe-purple font-medium" : ""
            }`}
          >
            <BookOpen size={18} />
            Curriculum
          </Link>
          <Link 
            to="/github-editor" 
            className={`flex items-center gap-2 text-vibe-dark hover:text-vibe-purple transition-colors ${
              isActive("/github-editor") ? "text-vibe-purple font-medium" : ""
            }`}
          >
            <Github size={18} />
            GitHub Editor
          </Link>
          <Link 
            to="/prompt-designer" 
            className={`flex items-center gap-2 text-vibe-dark hover:text-vibe-purple transition-colors ${
              isActive("/prompt-designer") ? "text-vibe-purple font-medium" : ""
            }`}
          >
            <Wand2 size={18} />
            Prompt Designer
          </Link>
          <a href="#pricing" className="text-vibe-dark hover:text-vibe-purple transition-colors">
            Pricing
          </a>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" className="border-vibe-purple text-vibe-purple hover:bg-vibe-purple hover:text-white">
            Log in
          </Button>
          <Button className="bg-vibe-purple hover:bg-vibe-purple/90 text-white">
            Start Free Trial
          </Button>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-vibe-dark"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden px-4 py-4 bg-white border-t">
          <div className="flex flex-col space-y-3">
            <Link 
              to="/" 
              className={`flex items-center gap-2 text-vibe-dark hover:text-vibe-purple transition-colors py-2 ${
                isActive("/") ? "text-vibe-purple font-medium" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Code size={18} />
              Home
            </Link>
            <Link 
              to="/curriculum" 
              className={`flex items-center gap-2 text-vibe-dark hover:text-vibe-purple transition-colors py-2 ${
                isActive("/curriculum") ? "text-vibe-purple font-medium" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen size={18} />
              Curriculum
            </Link>
            <Link 
              to="/github-editor" 
              className={`flex items-center gap-2 text-vibe-dark hover:text-vibe-purple transition-colors py-2 ${
                isActive("/github-editor") ? "text-vibe-purple font-medium" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Github size={18} />
              GitHub Editor
            </Link>
            <Link 
              to="/prompt-designer" 
              className={`flex items-center gap-2 text-vibe-dark hover:text-vibe-purple transition-colors py-2 ${
                isActive("/prompt-designer") ? "text-vibe-purple font-medium" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Wand2 size={18} />
              Prompt Designer
            </Link>
            <a 
              href="#pricing" 
              className="text-vibe-dark hover:text-vibe-purple transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <div className="flex flex-col space-y-2 pt-2">
              <Button variant="outline" className="border-vibe-purple text-vibe-purple hover:bg-vibe-purple hover:text-white w-full">
                Log in
              </Button>
              <Button className="bg-vibe-purple hover:bg-vibe-purple/90 text-white w-full">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

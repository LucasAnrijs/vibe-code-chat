
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm py-4 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-vibe-purple font-bold text-xl">VibeCode</span>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-vibe-dark hover:text-vibe-purple transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-vibe-dark hover:text-vibe-purple transition-colors">
            How It Works
          </a>
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
            <a 
              href="#features" 
              className="text-vibe-dark hover:text-vibe-purple transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="text-vibe-dark hover:text-vibe-purple transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </a>
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

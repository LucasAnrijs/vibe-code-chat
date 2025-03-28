
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Github, BookOpen, Code, Brain, Wand2, FolderTree } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="fixed top-0 left-0 z-50 w-full bg-white shadow-sm">
      <div className="container flex items-center justify-between h-16 mx-auto">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
          <Button variant="ghost" onClick={() => navigate("/")}>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-vibe-purple to-vibe-pink">
              Lovable AI
            </span>
          </Button>
        </div>

        <div className={cn("transition-all md:flex", isMobile ? (mobileMenuOpen ? "block absolute top-16 left-0 w-full bg-white shadow-md z-50" : "hidden") : "")}>
          <NavigationMenu>
            <NavigationMenuList className={cn(isMobile && "flex-col w-full")}>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  onClick={() => navigate("/curriculum")}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Curriculum
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  onClick={() => navigate("/github-editor")}
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <Brain className="w-4 h-4 mr-2" />
                  AI Tools
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    <ListItem
                      href="/agent-builder"
                      title="Agent Builder"
                      icon={<Code className="w-4 h-4 mr-2" />}
                    >
                      Build and deploy custom AI agents with specialized capabilities
                    </ListItem>
                    <ListItem
                      href="/prompt-designer"
                      title="Prompt Designer"
                      icon={<Wand2 className="w-4 h-4 mr-2" />}
                    >
                      Design and refine prompts for generating code
                    </ListItem>
                    <ListItem
                      href="/architecture-generator"
                      title="Architecture Generator"
                      icon={<FolderTree className="w-4 h-4 mr-2" />}
                    >
                      Convert architecture into working applications
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/progress")}
          >
            My Progress
          </Button>
          <Button 
            onClick={() => navigate("/agent-builder")}
            className="hidden md:flex"
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Studio
          </Button>
        </div>
      </div>
    </div>
  );
};

const ListItem = ({
  className,
  title,
  children,
  href,
  icon,
  ...props
}: {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
  icon?: React.ReactNode;
}) => {
  const navigate = useNavigate();
  
  return (
    <li className={cn("block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground", className)}>
      <div 
        className="cursor-pointer"
        onClick={() => navigate(href)}
        {...props}
      >
        <div className="flex items-center text-sm font-medium leading-none">
          {icon}
          {title}
        </div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </div>
    </li>
  );
};

export default Navbar;

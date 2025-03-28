
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GithubFile, GithubRepo, parseGithubUrl } from "@/services/githubService";
import RepoExplorer from "@/components/RepoExplorer";
import CodeEditor from "@/components/CodeEditor";
import { toast } from "@/hooks/use-toast";
import { Github, ExternalLink } from "lucide-react";

const GitHubEditor = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [repo, setRepo] = useState<GithubRepo | null>(null);
  const [selectedFile, setSelectedFile] = useState<GithubFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenRepo = () => {
    setIsLoading(true);
    const parsedRepo = parseGithubUrl(repoUrl);
    
    if (parsedRepo) {
      setRepo(parsedRepo);
      setSelectedFile(null);
      toast({
        title: "Repository opened",
        description: `${parsedRepo.owner}/${parsedRepo.repo} (${parsedRepo.branch})`,
      });
    } else {
      toast({
        title: "Invalid GitHub URL",
        description: "Please enter a valid GitHub repository URL",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleFileSelect = (file: GithubFile) => {
    setSelectedFile(file);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">GitHub Repository Editor</h1>
              <p className="text-gray-600 mb-6">
                Browse and edit code from any public GitHub repository. Enter a repository URL to get started.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="flex-grow"
                />
                <Button 
                  onClick={handleOpenRepo} 
                  disabled={isLoading || !repoUrl}
                  className="bg-vibe-purple hover:bg-vibe-purple/90 whitespace-nowrap"
                >
                  <Github className="mr-2 h-4 w-4" />
                  Open Repository
                </Button>
              </div>
              
              {repo && (
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span>Viewing:</span>
                  <a 
                    href={`https://github.com/${repo.owner}/${repo.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-vibe-purple hover:underline flex items-center"
                  >
                    {repo.owner}/{repo.repo}
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                  <span className="ml-2">
                    Branch: <span className="font-medium">{repo.branch}</span>
                  </span>
                </div>
              )}
            </div>
            
            {repo && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
                <div className="md:col-span-1">
                  <RepoExplorer 
                    repo={repo} 
                    onFileSelect={handleFileSelect} 
                  />
                </div>
                <div className="md:col-span-2">
                  <CodeEditor 
                    repo={repo} 
                    file={selectedFile} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GitHubEditor;

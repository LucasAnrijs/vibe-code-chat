import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GithubFile, GithubRepo, GithubAuth, parseGithubUrl, getUserInfo } from "@/services/githubService";
import RepoExplorer from "@/components/RepoExplorer";
import CodeEditor from "@/components/CodeEditor";
import GitHubAssistant from "@/components/GitHubAssistant";
import RepoRAGBuilder from "@/components/RepoRAGBuilder";
import { toast } from "@/hooks/use-toast";
import { Github, ExternalLink, Lock, MessageSquare, Code, Database } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const tokenSchema = z.object({
  token: z.string().min(1, "GitHub token is required"),
});

const STORAGE_TOKEN_KEY = "github-token";

const GitHubEditor = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [repo, setRepo] = useState<GithubRepo | null>(null);
  const [selectedFile, setSelectedFile] = useState<GithubFile | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [auth, setAuth] = useState<GithubAuth | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showRagBuilder, setShowRagBuilder] = useState(false);

  const form = useForm<z.infer<typeof tokenSchema>>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      token: "",
    },
  });

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (savedToken) {
      setAuth({ token: savedToken });
      fetchUsername(savedToken);
    }
  }, []);

  const fetchUsername = async (token: string) => {
    const userInfo = await getUserInfo({ token });
    if (userInfo) {
      setAuth({ token, username: userInfo.login });
    }
  };

  const handleOpenRepo = () => {
    setIsLoading(true);
    const parsedRepo = parseGithubUrl(repoUrl);
    
    if (parsedRepo) {
      setRepo(parsedRepo);
      setSelectedFile(null);
      setFileContent(null);
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

  const handleFileContentUpdate = (content: string) => {
    setFileContent(content);
  };

  const handleLogin = async (values: z.infer<typeof tokenSchema>) => {
    try {
      const { token } = values;
      
      const userInfo = await getUserInfo({ token });
      
      if (userInfo) {
        localStorage.setItem(STORAGE_TOKEN_KEY, token);
        setAuth({ token, username: userInfo.login });
        setShowAuthDialog(false);
        
        toast({
          title: "Authentication successful",
          description: `Signed in as ${userInfo.login}`,
        });
      } else {
        throw new Error("Failed to authenticate with GitHub. Please check your token.");
      }
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    setAuth(null);
    toast({
      title: "Logged out",
      description: "GitHub credentials have been removed",
    });
  };

  const toggleAssistant = () => {
    setShowAssistant(!showAssistant);
  };

  const toggleRagBuilder = () => {
    setShowRagBuilder(!showRagBuilder);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-auto">
      <Navbar />
      
      <main className="flex-grow pt-20 overflow-auto">
        <div className="container mx-auto px-4 py-8 overflow-auto">
          <div className="max-w-6xl mx-auto overflow-auto">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-bold">GitHub Repository Editor</h1>
                <div className="flex items-center gap-2">
                  {auth ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Signed in as <span className="font-medium">{auth.username}</span>
                      </span>
                      <Button variant="outline" size="sm" onClick={handleLogout}>
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAuthDialog(true)}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Sign In with GitHub
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAssistant}
                    className={showAssistant ? "bg-vibe-purple/10" : ""}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {showAssistant ? "Hide Assistant" : "Show Assistant"}
                  </Button>
                  
                  {repo && showAssistant && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleRagBuilder}
                      className={showRagBuilder ? "bg-vibe-purple/10" : ""}
                    >
                      <Database className="mr-2 h-4 w-4" />
                      {showRagBuilder ? "Hide RAG Builder" : "Show RAG Builder"}
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Browse and edit code from any public GitHub repository. Enter a repository URL to get started.
                {!auth && " Sign in with GitHub to enable saving changes."}
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
              <div className={`grid gap-6 h-[70vh] overflow-auto ${
                showAssistant && showRagBuilder 
                  ? 'grid-cols-1 md:grid-cols-12' 
                  : showAssistant 
                    ? 'grid-cols-1 md:grid-cols-4' 
                    : 'grid-cols-1 md:grid-cols-3'
              }`}>
                <div className="md:col-span-1">
                  <RepoExplorer 
                    repo={repo} 
                    onFileSelect={handleFileSelect}
                    auth={auth}
                  />
                </div>
                
                <div className={`${
                  showAssistant && showRagBuilder
                    ? 'md:col-span-7'
                    : showAssistant
                      ? 'md:col-span-2'
                      : 'md:col-span-2'
                } overflow-auto`}>
                  <CodeEditor 
                    repo={repo} 
                    file={selectedFile}
                    auth={auth}
                    onContentUpdate={handleFileContentUpdate}
                  />
                </div>
                
                {showAssistant && (
                  <div className={`${showRagBuilder ? 'md:col-span-3' : 'md:col-span-1'} overflow-auto space-y-6`}>
                    {showRagBuilder && (
                      <RepoRAGBuilder repo={repo} auth={auth} />
                    )}
                    <GitHubAssistant 
                      repoName={repo ? `${repo.owner}/${repo.repo}` : ""} 
                      currentFile={selectedFile?.name || null}
                      fileContent={fileContent}
                      repo={repo}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>GitHub Authentication</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Personal Access Token</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your token"
                      />
                    </FormControl>
                    <FormDescription>
                      You need a token with 'repo' scope permissions.{' '}
                      <a 
                        href="https://github.com/settings/tokens/new" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-vibe-purple hover:underline"
                      >
                        Create one here
                      </a>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="submit">Sign In</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default GitHubEditor;

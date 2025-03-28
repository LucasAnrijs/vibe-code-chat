
import { useState, useEffect } from "react";
import { ChevronRight, File, Folder, FolderOpen, ArrowLeft } from "lucide-react";
import { GithubFile, GithubRepo, GithubAuth, fetchRepoContents } from "@/services/githubService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface RepoExplorerProps {
  repo: GithubRepo;
  onFileSelect: (file: GithubFile) => void;
  auth: GithubAuth | null;
}

const RepoExplorer = ({ repo, onFileSelect, auth }: RepoExplorerProps) => {
  const [currentPath, setCurrentPath] = useState("");
  const [contents, setContents] = useState<GithubFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const loadContents = async (path: string = "") => {
    setIsLoading(true);
    const files = await fetchRepoContents(repo, path, auth || undefined);
    setContents(files);
    setCurrentPath(path);
    setIsLoading(false);
  };

  const navigateBack = () => {
    if (!currentPath) return;
    
    const pathParts = currentPath.split('/');
    pathParts.pop();
    const newPath = pathParts.join('/');
    loadContents(newPath);
  };

  // Load initial contents when repo or auth changes
  useEffect(() => {
    if (repo) {
      loadContents();
    }
  }, [repo, auth]);

  const handleItemClick = async (item: GithubFile) => {
    if (item.type === 'dir') {
      loadContents(item.path);
    } else {
      onFileSelect(item);
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading repository contents...</div>;
  }

  return (
    <div className="border rounded-md h-full bg-white">
      <div className="flex items-center justify-between bg-gray-50 p-2 border-b">
        <h3 className="text-sm font-medium">
          {repo.owner}/{repo.repo}
          {currentPath && `: ${currentPath}`}
        </h3>
        {currentPath && (
          <Button variant="ghost" size="sm" onClick={navigateBack} className="h-7 px-2">
            <ArrowLeft size={16} />
            <span className="ml-1">Back</span>
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[calc(100%-42px)]">
        <div className="p-1">
          {contents.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No files found</div>
          ) : (
            <div className="space-y-1">
              {contents
                .sort((a, b) => {
                  // Sort directories first, then files
                  if (a.type !== b.type) {
                    return a.type === 'dir' ? -1 : 1;
                  }
                  // Then sort alphabetically
                  return a.name.localeCompare(b.name);
                })
                .map((item) => (
                  <div key={item.path} className="text-sm">
                    <button
                      onClick={() => handleItemClick(item)}
                      className="w-full text-left flex items-center hover:bg-gray-100 p-1.5 rounded transition-colors"
                    >
                      {item.type === 'dir' ? (
                        <>
                          <span className="mr-1">
                            {expandedFolders[item.path] ? <FolderOpen size={16} className="text-yellow-500" /> : <Folder size={16} className="text-yellow-500" />}
                          </span>
                          <span>{item.name}</span>
                          <ChevronRight size={14} className="ml-auto" />
                        </>
                      ) : (
                        <>
                          <File size={16} className="mr-1 text-gray-500" />
                          <span>{item.name}</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RepoExplorer;

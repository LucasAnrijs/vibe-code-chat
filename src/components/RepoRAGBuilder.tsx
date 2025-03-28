
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { GithubRepo, GithubAuth } from "@/services/githubService";
import { buildRepoRAG, getRepoRAG } from "@/services/ragService";
import { Database, RefreshCw, AlertCircle } from "lucide-react";

interface RepoRAGBuilderProps {
  repo: GithubRepo;
  auth: GithubAuth | null;
}

const RepoRAGBuilder = ({ repo, auth }: RepoRAGBuilderProps) => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isBuilt, setIsBuilt] = useState(false);
  const [fileCount, setFileCount] = useState(0);

  // Check if RAG is already built
  useEffect(() => {
    if (repo) {
      const rag = getRepoRAG(repo);
      if (rag) {
        setIsBuilt(true);
        setFileCount(rag.files.length);
      } else {
        setIsBuilt(false);
        setFileCount(0);
      }
    }
  }, [repo]);

  const handleBuildRAG = async () => {
    setIsBuilding(true);
    setProgress(0);

    try {
      const result = await buildRepoRAG(repo, auth || undefined, (progress) => {
        setProgress(progress * 100);
      });

      if (result) {
        const rag = getRepoRAG(repo);
        setIsBuilt(true);
        setFileCount(rag?.files.length || 0);
      }
    } catch (error) {
      console.error("Error building RAG:", error);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <Card className="p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Database size={18} className="text-vibe-purple mr-2" />
          <h3 className="text-sm font-medium">Repository Context Builder</h3>
        </div>
      </div>

      {isBuilt ? (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertTitle>Repository indexed</AlertTitle>
          <AlertDescription>
            {fileCount} files have been indexed and are available for the AI assistant.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Repository not indexed</AlertTitle>
          <AlertDescription>
            Build the repository index to enhance AI responses with context from your code.
          </AlertDescription>
        </Alert>
      )}

      {isBuilding && (
        <div className="my-4">
          <p className="text-xs text-gray-500 mb-2">Building repository index...</p>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="mt-4 w-full"
        onClick={handleBuildRAG}
        disabled={isBuilding}
      >
        {isBuilding ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Building...
          </>
        ) : isBuilt ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Rebuild Index
          </>
        ) : (
          <>
            <Database className="mr-2 h-4 w-4" />
            Build Repository Index
          </>
        )}
      </Button>
    </Card>
  );
};

export default RepoRAGBuilder;

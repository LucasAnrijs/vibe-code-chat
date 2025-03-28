
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GithubFile, GithubRepo, fetchFileContent } from "@/services/githubService";
import { Save, Copy, FileCode } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CodeEditorProps {
  repo: GithubRepo;
  file: GithubFile | null;
}

const CodeEditor = ({ repo, file }: CodeEditorProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadFileContent = async () => {
      if (!file) return;
      
      setIsLoading(true);
      const content = await fetchFileContent(repo, file.path);
      if (content !== null) {
        setCode(content);
      }
      setIsLoading(false);
    };
    
    loadFileContent();
  }, [file, repo]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: `${file?.name} content copied to clipboard`,
    });
  };

  const handleSaveChanges = () => {
    // In a real app, this would call the GitHub API to save changes
    // Currently we're only demonstrating the UI flow
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Changes saved",
        description: `${file?.name} has been updated`,
      });
    }, 1000);
  };

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 border rounded-md p-8">
        <div className="text-center">
          <FileCode className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No file selected</h3>
          <p className="mt-1 text-sm text-gray-500">Select a file from the repository explorer to view and edit its content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border rounded-md bg-white">
      <div className="flex items-center justify-between bg-gray-50 p-2 border-b">
        <h3 className="text-sm font-medium truncate">
          {file.path}
        </h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 px-2"
            onClick={handleCopyCode}
          >
            <Copy size={14} className="mr-1" />
            Copy
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="h-7 px-2"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            <Save size={14} className="mr-1" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      
      <div className="flex-grow overflow-hidden p-2">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p>Loading file content...</p>
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono text-sm h-full resize-none"
          />
        )}
      </div>
    </div>
  );
};

export default CodeEditor;

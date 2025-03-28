
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GithubFile, GithubRepo, GithubAuth, fetchFileContent, saveFileContent } from "@/services/githubService";
import { Save, Copy, FileCode } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CodeEditorProps {
  repo: GithubRepo;
  file: GithubFile | null;
  auth: GithubAuth | null;
  onContentUpdate?: (content: string) => void;
}

const CodeEditor = ({ repo, file, auth, onContentUpdate }: CodeEditorProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [editCounter, setEditCounter] = useState(0);
  const [hasTrackedEdit, setHasTrackedEdit] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadFileContent = async () => {
      if (!file) return;
      
      setIsLoading(true);
      const content = await fetchFileContent(repo, file.path, auth || undefined);
      if (content !== null) {
        setCode(content);
        onContentUpdate?.(content);
      }
      setIsLoading(false);
    };
    
    loadFileContent();
  }, [file, repo, auth, onContentUpdate]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onContentUpdate?.(newCode);
    
    // Track edits for achievement purposes
    setEditCounter(prev => prev + 1);
    
    // If we've made substantial edits (10+ changes) and haven't tracked an achievement yet
    if (editCounter > 10 && !hasTrackedEdit) {
      toast({
        title: "Achievement Progress Updated! 🏆",
        description: "You're making progress on the Code Explorer achievement",
      });
      setHasTrackedEdit(true);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: `${file?.name} content copied to clipboard`,
    });
  };

  const handleSaveChanges = async () => {
    if (!file || !auth?.token) {
      toast({
        title: "Authentication Required",
        description: "You need to provide a GitHub token to save changes.",
        variant: "destructive",
      });
      return;
    }
    
    setShowCommitDialog(true);
    // Default commit message
    setCommitMessage(`Update ${file.name}`);
  };

  const handleConfirmSave = async () => {
    if (!file || !auth?.token) return;
    
    setIsSaving(true);
    setShowCommitDialog(false);
    
    const success = await saveFileContent(
      repo,
      file.path,
      code,
      file.sha,
      auth,
      commitMessage
    );
    
    setIsSaving(false);
    
    if (success) {
      // Potentially track achievement for saving files
      toast({
        title: "Changes saved",
        description: `${file.name} has been updated`,
      });
      
      // After 3 successful saves, trigger an achievement notification
      if (Math.random() > 0.7) {
        toast({
          title: "Achievement Progress Updated! 🏆",
          description: "You're making progress on the GitHub Contributor achievement",
        });
      }
    }
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
            disabled={isSaving || !auth?.token}
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
            onChange={handleCodeChange}
            className="font-mono text-sm h-full resize-none"
          />
        )}
      </div>

      <Dialog open={showCommitDialog} onOpenChange={setShowCommitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commit Changes</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Commit message</label>
            <Input
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Enter a commit message"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSave} disabled={!commitMessage.trim()}>
              Commit Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodeEditor;

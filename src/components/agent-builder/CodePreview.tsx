
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeArtifact } from "@/lib/agent-types";
import { Copy, Download, Check, FileCode } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CodePreviewProps {
  artifact: CodeArtifact | null;
}

const CodePreview = ({ artifact }: CodePreviewProps) => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Set the first file as active when artifact changes
  if (artifact && Object.keys(artifact.files).length > 0 && !activeFile) {
    setActiveFile(Object.keys(artifact.files)[0]);
  }

  const handleCopyCode = () => {
    if (!activeFile || !artifact) return;
    
    navigator.clipboard.writeText(artifact.files[activeFile]);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: `${activeFile} has been copied to your clipboard.`
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    if (!artifact) return;
    
    // Create a zip file in a real implementation
    // For now, we'll just download the active file
    if (activeFile) {
      const blob = new Blob([artifact.files[activeFile]], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeFile;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "File Downloaded",
        description: `${activeFile} has been downloaded.`
      });
    }
  };

  if (!artifact) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 border rounded-md">
        <FileCode className="h-16 w-16 mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Code Generated Yet</h3>
        <p>Configure your agent and design a prompt to generate code</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Generated Files</h3>
          <p className="text-sm text-gray-500">
            Generated using {artifact.metadata.providerUsed} on {new Date(artifact.metadata.generatedAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleCopyCode} disabled={!activeFile || copied}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </>
            )}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleDownloadCode}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Tabs value={activeFile || ""} onValueChange={setActiveFile}>
          <div className="bg-gray-100 border-b px-4 py-2">
            <TabsList className="bg-transparent">
              {Object.keys(artifact.files).map((filename) => (
                <TabsTrigger 
                  key={filename} 
                  value={filename}
                  className="data-[state=active]:bg-white"
                >
                  {filename}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {Object.entries(artifact.files).map(([filename, content]) => (
            <TabsContent key={filename} value={filename} className="m-0">
              <pre className="bg-gray-900 text-gray-200 p-4 rounded-b-md overflow-auto text-sm font-mono h-[400px]">
                <code>{content}</code>
              </pre>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default CodePreview;

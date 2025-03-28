
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeArtifact } from "@/lib/agent-types";
import { Copy, Download, Check, FileCode, FileText, FolderTree } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface GeneratedCodeViewerProps {
  artifact: CodeArtifact | null;
}

const GeneratedCodeViewer: React.FC<GeneratedCodeViewerProps> = ({ artifact }) => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [folderStructure, setFolderStructure] = useState<Record<string, string[]>>({});

  // Set the first file as active when artifact changes
  useEffect(() => {
    if (artifact && Object.keys(artifact.files).length > 0) {
      setActiveFile(Object.keys(artifact.files)[0]);
      
      // Generate folder structure
      const structure: Record<string, string[]> = {};
      
      Object.keys(artifact.files).forEach(filePath => {
        // Skip architecture files or system files
        if (filePath.includes('architecture') || filePath.endsWith('.txt')) {
          return;
        }
        
        // Extract folder path
        const folderPath = filePath.includes('/')
          ? filePath.substring(0, filePath.lastIndexOf('/'))
          : '';
        
        if (!structure[folderPath]) {
          structure[folderPath] = [];
        }
        
        structure[folderPath].push(filePath);
      });
      
      setFolderStructure(structure);
    } else {
      setActiveFile(null);
    }
  }, [artifact]);

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

  const handleDownloadAll = () => {
    if (!artifact) return;
    
    // In a real implementation, this would create a zip file with all files
    toast({
      title: "Download All",
      description: "In a production app, this would download all files as a zip archive."
    });
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.ts') || filename.endsWith('.js')) {
      return <FileCode className="h-4 w-4" />;
    }
    if (filename.endsWith('.tsx') || filename.endsWith('.jsx')) {
      return <FileCode className="h-4 w-4 text-blue-500" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const renderFolderStructure = () => {
    if (!artifact) return null;
    
    return (
      <div className="border rounded p-3 mb-4 bg-gray-50">
        <div className="flex items-center mb-2">
          <FolderTree className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Generated Project Structure</h3>
        </div>
        <div className="pl-4 text-sm font-mono">
          <div className="flex items-center">
            <span>src/</span>
          </div>
          {Object.keys(folderStructure).sort().map(folder => (
            <div key={folder} className="ml-4">
              {folder ? (
                <div className="flex items-center mt-1">
                  <span>{folder.split('/').pop()}/</span>
                </div>
              ) : null}
              <div className="ml-4">
                {folderStructure[folder].sort().map(file => (
                  <div 
                    key={file} 
                    className={`flex items-center cursor-pointer hover:bg-gray-200 px-1 rounded ${activeFile === file ? 'bg-gray-200 font-medium' : ''}`}
                    onClick={() => setActiveFile(file)}
                  >
                    {getFileIcon(file)}
                    <span className="ml-1">{file.split('/').pop()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!artifact) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 border rounded-md">
        <FileCode className="h-16 w-16 mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Code Generated Yet</h3>
        <p>Provide an architecture structure and generate code to see the results</p>
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
          
          <Button variant="outline" size="sm" onClick={handleDownloadCode} disabled={!activeFile}>
            <Download className="mr-2 h-4 w-4" />
            Download File
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleDownloadAll}>
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
        </div>
      </div>
      
      {renderFolderStructure()}
      
      <div className="border rounded-md overflow-hidden">
        <Tabs value={activeFile || ""} onValueChange={setActiveFile}>
          <div className="bg-gray-100 border-b px-4 py-2 overflow-x-auto">
            <TabsList className="bg-transparent inline-flex flex-wrap">
              {Object.keys(artifact.files)
                .filter(filename => !filename.includes('architecture') && !filename.endsWith('.txt'))
                .map((filename) => (
                <TabsTrigger 
                  key={filename} 
                  value={filename}
                  className="data-[state=active]:bg-white flex items-center"
                >
                  {getFileIcon(filename)}
                  <span className="ml-2 truncate max-w-[200px]">{filename}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {Object.entries(artifact.files)
            .filter(([filename]) => !filename.includes('architecture') && !filename.endsWith('.txt'))
            .map(([filename, content]) => (
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

export default GeneratedCodeViewer;


import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeArtifact } from "@/lib/agent-types";
import { Copy, Download, Check, FileCode, FileText, FolderTree, Play, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface GeneratedCodeViewerProps {
  artifact: CodeArtifact | null;
  onShowPreview?: () => void;
}

const GeneratedCodeViewer: React.FC<GeneratedCodeViewerProps> = ({ artifact, onShowPreview }) => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [folderStructure, setFolderStructure] = useState<Record<string, string[]>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

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

  const generateQuickPreview = () => {
    if (!artifact) return;
    
    setPreviewLoading(true);
    setPreviewOpen(true);
    
    try {
      // Find an App.tsx or index.tsx file to preview
      const mainFile = Object.keys(artifact.files).find(
        file => file.includes('/App.tsx') || file.includes('/index.tsx')
      ) || (activeFile?.endsWith('.tsx') ? activeFile : null);
      
      if (!mainFile) {
        toast({
          title: "Preview Failed",
          description: "Could not find a suitable file to preview.",
          variant: "destructive"
        });
        setPreviewLoading(false);
        return;
      }
      
      // Basic HTML template for preview
      const previewTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Quick Preview</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { 
              font-family: 'Inter', sans-serif;
              padding: 20px;
              background-color: #f9fafb;
            }
            .preview-container {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              background-color: white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            <div id="root"></div>
          </div>
          
          <script type="text/babel">
            const { useState, useEffect, useRef, useCallback, useMemo } = React;
            
            // Mock components
            const Button = (props) => <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" {...props}>{props.children}</button>;
            const Input = (props) => <input className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" {...props} />;
            const Card = ({children, className, ...props}) => <div className={\`bg-white p-4 rounded-lg shadow \${className || ''}\`} {...props}>{children}</div>;
            
            // Component code
            ${artifact.files[mainFile]}
            
            // Simple rendering - try to handle different export formats
            try {
              const componentName = '${mainFile.split('/').pop()?.replace(/\.[jt]sx?$/, '')}';
              const AppComponent = window[componentName] || App || Index || Home || Main || Dashboard || Component;
              ReactDOM.render(<AppComponent />, document.getElementById('root'));
            } catch (e) {
              document.getElementById('root').innerHTML = \`<div class="text-red-500 p-4"><p><strong>Render Error:</strong> \${e.message}</p><p>Check console for details.</p></div>\`;
              console.error(e);
            }
          </script>
        </body>
        </html>
      `;
      
      setPreviewHtml(previewTemplate);
    } catch (error) {
      console.error("Preview generation error:", error);
      toast({
        title: "Preview Generation Failed",
        description: "Failed to generate a preview. See console for details.",
        variant: "destructive"
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleLivePreview = () => {
    // Call the onShowPreview callback to switch to the preview tab
    if (onShowPreview) {
      onShowPreview();
    } else {
      // If no callback provided, show quick preview dialog
      generateQuickPreview();
    }
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
          
          <Button variant="default" size="sm" onClick={handleLivePreview} className="bg-green-600 hover:bg-green-700">
            <Play className="mr-2 h-4 w-4" />
            Live Preview
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
      
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Quick Preview</DialogTitle>
            <DialogDescription>
              This is a simplified preview of your generated application.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow relative">
            {previewLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-500">Generating preview...</p>
                </div>
              </div>
            ) : (
              <iframe 
                srcDoc={previewHtml}
                title="Application Preview"
                className="w-full h-full border rounded"
                sandbox="allow-scripts"
              />
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onShowPreview && onShowPreview()}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Full Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GeneratedCodeViewer;

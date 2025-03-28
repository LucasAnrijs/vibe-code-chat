
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeArtifact } from "@/lib/agent-types";
import { Copy, Download, Check, FileCode, FileText, Wand2, List, Code } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CircuitBreaker } from "@/lib/agent-types";
import { AnthropicProvider } from "@/services/llm-providers/AnthropicProvider";
import { OpenAIProvider } from "@/services/llm-providers/OpenAIProvider";
import { CodeGenerationService } from "@/services/CodeGenerationService";

interface CodePreviewProps {
  artifact: CodeArtifact | null;
}

const CodePreview = ({ artifact }: CodePreviewProps) => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Set the first file as active when artifact changes
  useEffect(() => {
    if (artifact && Object.keys(artifact.files).length > 0) {
      setActiveFile(Object.keys(artifact.files)[0]);
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
    // For this example, we'll just show a toast message
    toast({
      title: "Download All",
      description: "In a production app, this would download all files as a zip archive."
    });
  };

  const handleGenerateImplementation = async () => {
    if (!artifact || !activeFile || !artifact.files[activeFile]) return;
    
    // Check if the active file is an architecture file
    if (!activeFile.includes('architecture') && !activeFile.endsWith('.txt')) {
      toast({
        title: "Not an Architecture File",
        description: "Please select an architecture file to generate code implementation.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // We'll use Anthropic by default, but in a real app this could be configurable
      const apiKey = localStorage.getItem('anthropic_api_key') || localStorage.getItem('openai_api_key');
      
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: "Please configure an API key in the agent settings.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }
      
      const architecture = artifact.files[activeFile];
      
      // Create a provider
      const provider = localStorage.getItem('anthropic_api_key') 
        ? new AnthropicProvider({ type: 'anthropic', apiKey: localStorage.getItem('anthropic_api_key')! })
        : new OpenAIProvider({ type: 'openai', apiKey: localStorage.getItem('openai_api_key')! });
      
      // Initialize the code generation service
      const codeGenerationService = new CodeGenerationService([provider]);
      
      // Generate implementation from architecture
      const newArtifact = await codeGenerationService.generateFilesFromArchitecture(
        architecture,
        ['Generate a complete implementation for each component/module']
      );
      
      if (newArtifact) {
        // Merge new files with existing ones
        Object.assign(artifact.files, newArtifact.files);
        
        // Update metadata
        artifact.metadata = newArtifact.metadata;
        
        // Set the first non-architecture file as active
        const implementationFiles = Object.keys(newArtifact.files);
        if (implementationFiles.length > 0) {
          setActiveFile(implementationFiles[0]);
        }
        
        toast({
          title: "Code Generated",
          description: `Generated ${implementationFiles.length} implementation files from the architecture.`
        });
      }
    } catch (error) {
      console.error("Code generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate code. Please check your configuration and try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateComponentsFromArchitecture = async () => {
    if (!artifact || !activeFile || !artifact.files[activeFile]) return;
    
    // Check if the active file is an architecture file
    if (!activeFile.includes('architecture') && !activeFile.endsWith('.txt')) {
      toast({
        title: "Not an Architecture File",
        description: "Please select an architecture file to generate components.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // We'll use Anthropic by default, but in a real app this could be configurable
      const apiKey = localStorage.getItem('anthropic_api_key') || localStorage.getItem('openai_api_key');
      
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: "Please configure an API key in the agent settings.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }
      
      const architecture = artifact.files[activeFile];
      
      // Create a provider
      const provider = localStorage.getItem('anthropic_api_key') 
        ? new AnthropicProvider({ type: 'anthropic', apiKey: localStorage.getItem('anthropic_api_key')! })
        : new OpenAIProvider({ type: 'openai', apiKey: localStorage.getItem('openai_api_key')! });
      
      // Initialize the code generation service
      const codeGenerationService = new CodeGenerationService([provider]);
      
      toast({
        title: "Generation Started",
        description: "Generating files for each component in the architecture..."
      });
      
      // Generate a file for each line in the architecture
      const newArtifact = await codeGenerationService.generateFilesFromArchitecture(
        architecture,
        ['Create a separate file for each component or module mentioned']
      );
      
      if (newArtifact) {
        // Merge new files with existing ones
        Object.assign(artifact.files, newArtifact.files);
        
        // Update metadata
        artifact.metadata = newArtifact.metadata;
        
        // Set the first non-architecture file as active
        const implementationFiles = Object.keys(newArtifact.files).filter(
          file => !file.includes('architecture') && !file.endsWith('output.txt')
        );
        
        if (implementationFiles.length > 0) {
          setActiveFile(implementationFiles[0]);
        }
        
        toast({
          title: "Code Generated",
          description: `Generated ${implementationFiles.length} implementation files from the architecture.`
        });
      }
    } catch (error) {
      console.error("Architecture-based generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate components from architecture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.ts') || filename.endsWith('.js')) {
      return <FileCode className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
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
          
          <Button variant="outline" size="sm" onClick={handleDownloadCode} disabled={!activeFile}>
            <Download className="mr-2 h-4 w-4" />
            Download File
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleDownloadAll}>
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
          
          {activeFile && (activeFile.includes('architecture') || activeFile.endsWith('.txt')) && (
            <>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleGenerateImplementation}
                disabled={isGenerating}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate Implementation'}
              </Button>
              
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleGenerateComponentsFromArchitecture}
                disabled={isGenerating}
              >
                <List className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate Per Line'}
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Tabs value={activeFile || ""} onValueChange={setActiveFile}>
          <div className="bg-gray-100 border-b px-4 py-2 overflow-x-auto">
            <TabsList className="bg-transparent inline-flex">
              {Object.keys(artifact.files).map((filename) => (
                <TabsTrigger 
                  key={filename} 
                  value={filename}
                  className="data-[state=active]:bg-white flex items-center"
                >
                  {getFileIcon(filename)}
                  <span className="ml-2">{filename}</span>
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


import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { CodeGenerationService } from "@/services/CodeGenerationService";
import { OpenAIProvider } from "@/services/llm-providers/OpenAIProvider";
import { AnthropicProvider } from "@/services/llm-providers/AnthropicProvider";
import { Copy, Play, Folder, FolderTree, Eye, FileCode, Loader } from "lucide-react";
import ArchitectureInput from "@/components/architecture-generator/ArchitectureInput";
import AppPreview from "@/components/architecture-generator/AppPreview";
import GeneratedCodeViewer from "@/components/architecture-generator/GeneratedCodeViewer";
import { CodeArtifact } from "@/lib/agent-types";

const ArchitectureGenerator = () => {
  const [architecture, setArchitecture] = useState<string>("");
  const [activeTab, setActiveTab] = useState("architecture");
  const [generatedCode, setGeneratedCode] = useState<CodeArtifact | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai');

  const handleGenerateApp = async () => {
    if (!architecture.trim()) {
      toast({
        title: "Architecture Required",
        description: "Please provide an architecture structure before generating.",
        variant: "destructive"
      });
      return;
    }

    const apiKey = localStorage.getItem(`${provider}_api_key`);
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: `Please set your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key in the provider settings.`,
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Create provider instance based on selected provider
      const llmProvider = provider === 'openai'
        ? new OpenAIProvider({ type: 'openai', apiKey })
        : new AnthropicProvider({ type: 'anthropic', apiKey });

      // Initialize code generation service
      const codeGenerationService = new CodeGenerationService([llmProvider]);
      
      toast({
        title: "Generation Started",
        description: "Generating application from architecture structure..."
      });
      
      // Generate implementation from architecture
      const artifact = await codeGenerationService.generateFilesFromArchitecture(
        architecture,
        [
          'Generate complete implementation files for each component in the architecture',
          'Ensure each component is functional and imports any dependencies it needs',
          'Add appropriate TypeScript types and interfaces',
          'Create a cohesive application that demonstrates the architecture'
        ]
      );
      
      if (artifact) {
        setGeneratedCode(artifact);
        toast({
          title: "Application Generated",
          description: `Generated ${Object.keys(artifact.files).length} files from the architecture.`
        });
        
        // Switch to the preview tab
        setActiveTab("preview");
      }
    } catch (error) {
      console.error("Application generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate application. Please check your inputs and try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyArchitecture = () => {
    navigator.clipboard.writeText(architecture);
    toast({
      title: "Copied",
      description: "Architecture structure copied to clipboard"
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex items-center gap-3 mb-6">
          <FolderTree className="h-8 w-8 text-vibe-purple" />
          <h1 className="text-2xl font-bold">Architecture Generator</h1>
        </div>
        
        <p className="text-gray-600 mb-8">
          Transform an application architecture structure into a fully functional React TypeScript application.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="architecture" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Architecture Input
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2" disabled={!generatedCode}>
              <FileCode className="h-4 w-4" />
              Generated Code
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2" disabled={!generatedCode}>
              <Eye className="h-4 w-4" />
              App Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="architecture">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  Project Architecture
                </CardTitle>
                <CardDescription>
                  Provide your project architecture as a directory structure. Each line will be processed into components.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ArchitectureInput 
                  architecture={architecture} 
                  setArchitecture={setArchitecture} 
                  provider={provider}
                  setProvider={setProvider}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleCopyArchitecture}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Architecture
                </Button>
                <Button 
                  onClick={handleGenerateApp} 
                  disabled={isGenerating || !architecture.trim()}
                  className="bg-vibe-purple hover:bg-vibe-purple/90"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Generate Application
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="code">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Generated Code
                </CardTitle>
                <CardDescription>
                  Review the generated files for your application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GeneratedCodeViewer artifact={generatedCode} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Application Preview
                </CardTitle>
                <CardDescription>
                  Preview how your generated application would look when rendered.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppPreview artifact={generatedCode} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ArchitectureGenerator;

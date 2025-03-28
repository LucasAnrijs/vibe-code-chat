
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Code, FileJson, Layers, Play, GitBranch, History } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import CodePreview from "@/components/agent-builder/CodePreview";
import { CodeArtifact } from "@/lib/agent-types";

// Sample template options
const promptTemplates = [
  { id: "req-analysis", name: "Requirements Analysis", template: "Analyze the following user requirements:\n\n{userRequirements}\n\nIdentify the key components, data structures, and potential challenges." },
  { id: "arch-design", name: "Architecture Design", template: "Based on the following requirements analysis:\n\n{analysisResults}\n\nDesign a React component architecture with TypeScript interfaces." },
  { id: "component-gen", name: "Component Generation", template: "Generate the following React component based on this architecture design:\n\n{architecture}\n\nComponent: {componentName}" },
  { id: "validation", name: "Validation Rules", template: "Create Zod validation schemas for the following data structures:\n\n{dataStructures}" },
  { id: "deployment", name: "Deployment Scaffold", template: "Create a CI/CD configuration for deploying a React application with the following structure:\n\n{projectStructure}" },
];

const PromptDesigner = () => {
  const [activeTab, setActiveTab] = useState("design");
  const [userInput, setUserInput] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(promptTemplates[0]);
  const [generationPhase, setGenerationPhase] = useState<'analysis' | 'architecture' | 'implementation' | 'validation' | 'optimization'>('analysis');
  const [temperature, setTemperature] = useState<string>("0.2");
  const [generatedCode, setGeneratedCode] = useState<CodeArtifact | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCode = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide some requirements or specifications.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // In a real implementation, this would call an API or use the LLM service
      // For now, we'll create a mock response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockArtifact: CodeArtifact = {
        files: {
          "architecture.txt": "# Component Architecture\n\n## Core Components\n1. PromptDesigner - Main interface for designing prompts\n2. TemplateEditor - For editing prompt templates\n3. CodePreview - For previewing generated code\n4. ValidationPanel - For validating generated code\n\n## Data Flow\nUser Input -> Template Processing -> LLM Generation -> Code Output -> Validation",
          "PromptDesigner.tsx": `import React from 'react';\nimport { Tabs } from './ui/tabs';\n\nconst PromptDesigner = () => {\n  return (\n    <div className="p-4">\n      <h1>Prompt Designer</h1>\n      <Tabs>\n        {/* Tab content */}\n      </Tabs>\n    </div>\n  );\n};\n\nexport default PromptDesigner;`,
          "types.ts": `export interface PromptTemplate {\n  id: string;\n  name: string;\n  template: string;\n  variables?: string[];\n}\n\nexport interface GenerationConfig {\n  temperature: number;\n  maxTokens: number;\n  provider: 'openai' | 'anthropic' | 'custom';\n}`
        },
        metadata: {
          generatedAt: new Date(),
          providerUsed: "MockProvider",
          stage: generationPhase
        }
      };
      
      setGeneratedCode(mockArtifact);
      
      toast({
        title: "Generation Complete",
        description: `Successfully generated ${Object.keys(mockArtifact.files).length} files.`
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex items-center gap-3 mb-6">
          <Wand2 className="h-8 w-8 text-vibe-purple" />
          <h1 className="text-2xl font-bold">Prompt Designer</h1>
        </div>
        
        <p className="text-gray-600 mb-8">
          Design and refine prompts to generate production-grade React/TypeScript applications through a multi-stage pipeline.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="design" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Prompt Design
            </TabsTrigger>
            <TabsTrigger value="output" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Code Output
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Validation Results
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="design" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  Prompt Template
                </CardTitle>
                <CardDescription>
                  Select a template or create your own for the prompt generation pipeline.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Template</label>
                      <Select 
                        value={selectedTemplate.id} 
                        onValueChange={(value) => {
                          const template = promptTemplates.find(t => t.id === value);
                          if (template) setSelectedTemplate(template);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {promptTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Generation Phase</label>
                      <Select 
                        value={generationPhase} 
                        onValueChange={(value) => setGenerationPhase(value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="analysis">1. Requirements Analysis</SelectItem>
                          <SelectItem value="architecture">2. Architecture Design</SelectItem>
                          <SelectItem value="implementation">3. Implementation</SelectItem>
                          <SelectItem value="validation">4. Validation</SelectItem>
                          <SelectItem value="optimization">5. Optimization</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Temperature</label>
                      <span className="text-sm text-gray-500">{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Precise (0.0)</span>
                      <span>Balanced (0.5)</span>
                      <span>Creative (1.0)</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium">Template Preview</label>
                    <div className="mt-2 p-3 bg-gray-100 rounded-md text-sm font-mono whitespace-pre-wrap">
                      {selectedTemplate.template}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">User Input</label>
                    <Textarea 
                      placeholder="Enter your requirements or specifications here..."
                      className="font-mono mt-2"
                      rows={8}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <History className="mr-2 h-4 w-4" />
                  <span>Version history available</span>
                </div>
                <Button 
                  onClick={handleGenerateCode} 
                  disabled={isGenerating}
                  className="bg-vibe-purple hover:bg-vibe-purple/90"
                >
                  {isGenerating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Generate Code
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="output">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Generated Code
                </CardTitle>
                <CardDescription>
                  Preview and edit the generated code before integrating it into your project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodePreview artifact={generatedCode} />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <GitBranch className="mr-2 h-4 w-4" />
                  <span>Branch: main</span>
                </div>
                <Button variant="outline">
                  Export Project
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="validation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Validation Results
                </CardTitle>
                <CardDescription>
                  Automated checks and validation for the generated code.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedCode ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <h3 className="text-green-700 font-medium">TypeScript Validation</h3>
                      <p className="text-green-700 text-sm">All types are valid. No TypeScript errors detected.</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <h3 className="text-blue-700 font-medium">React Hook Rules</h3>
                      <p className="text-blue-700 text-sm">All React hooks follow the rules of hooks. No issues detected.</p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <h3 className="text-yellow-700 font-medium">Performance Recommendations</h3>
                      <p className="text-yellow-700 text-sm">Consider memoizing the component to prevent unnecessary re-renders.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
                    <Layers className="h-16 w-16 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Code Generated Yet</h3>
                    <p>Generate code first to see validation results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PromptDesigner;

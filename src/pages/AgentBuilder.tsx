import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AgentConfiguration from "@/components/agent-builder/AgentConfiguration";
import PromptDesigner from "@/components/agent-builder/PromptDesigner";
import CodePreview from "@/components/agent-builder/CodePreview";
import TestingPanel from "@/components/agent-builder/TestingPanel";
import { ProviderConfig, CodeArtifact } from "@/lib/agent-types";
import { toast } from "@/hooks/use-toast";
import { OpenAIProvider } from "@/services/llm-providers/OpenAIProvider";
import { AnthropicProvider } from "@/services/llm-providers/AnthropicProvider";
import { CodeGenerationService } from "@/services/CodeGenerationService";

const AgentBuilder = () => {
  const [activeTab, setActiveTab] = useState("configure");
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [generatedCode, setGeneratedCode] = useState<CodeArtifact | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState({
    specification: "",
    architecture: "",
    constraints: [""] 
  });

  const handleAddProvider = (provider: ProviderConfig) => {
    setProviders([...providers, provider]);
    toast({
      title: "Provider Added",
      description: `${provider.type} provider has been added to your agent.`,
    });
  };

  const handleRemoveProvider = (index: number) => {
    const newProviders = [...providers];
    newProviders.splice(index, 1);
    setProviders(newProviders);
  };

  const handleGenerateCode = async () => {
    if (providers.length === 0) {
      toast({
        title: "No Providers Configured",
        description: "Please add at least one AI provider to generate code.",
        variant: "destructive"
      });
      return;
    }

    if (!prompt.specification.trim()) {
      toast({
        title: "Empty Specification",
        description: "Please enter a specification for code generation.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create provider instances
      const providerInstances = providers.map(config => {
        switch (config.type) {
          case 'openai':
            return new OpenAIProvider(config);
          case 'anthropic':
            return new AnthropicProvider(config);
          default:
            throw new Error(`Provider type ${config.type} not implemented`);
        }
      });
      
      // Create code generation service
      const codeService = new CodeGenerationService(providerInstances);
      
      // Clean up constraints array (remove empty entries)
      const cleanConstraints = prompt.constraints.filter(c => c.trim() !== "");
      
      // Generate code
      const artifact = await codeService.generateComponent({
        specification: prompt.specification,
        architecture: prompt.architecture,
        constraints: cleanConstraints
      });
      
      if (artifact) {
        setGeneratedCode(artifact);
        toast({
          title: "Code Generated",
          description: "Your agent has successfully generated code based on your specifications."
        });
        
        // Move to the preview tab
        setActiveTab("preview");
      } else {
        toast({
          title: "Generation Failed",
          description: "Failed to generate code. Please check your configuration and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Code generation error:", error);
      toast({
        title: "Generation Error",
        description: "An unexpected error occurred during code generation.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Agent Builder</h1>
            <p className="text-gray-500 mb-6">Create, configure, and deploy your custom code generation agents</p>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="configure">Configure</TabsTrigger>
                <TabsTrigger value="prompt">Design Prompt</TabsTrigger>
                <TabsTrigger value="preview">Code Preview</TabsTrigger>
                <TabsTrigger value="test">Test & Deploy</TabsTrigger>
              </TabsList>
              
              <TabsContent value="configure" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Configuration</CardTitle>
                    <CardDescription>
                      Configure AI providers and settings for your code generation agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AgentConfiguration 
                      providers={providers}
                      onAddProvider={handleAddProvider}
                      onRemoveProvider={handleRemoveProvider}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="prompt" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Prompt Designer</CardTitle>
                    <CardDescription>
                      Craft the prompt that will be used for code generation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PromptDesigner 
                      prompt={prompt}
                      setPrompt={setPrompt}
                      onGenerateCode={handleGenerateCode}
                      isGenerating={isGenerating}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Code</CardTitle>
                    <CardDescription>
                      Preview and modify the generated code artifacts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodePreview artifact={generatedCode} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="test" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Testing & Deployment</CardTitle>
                    <CardDescription>
                      Test your agent against various inputs and deploy it
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TestingPanel artifact={generatedCode} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AgentBuilder;

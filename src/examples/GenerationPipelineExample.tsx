import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, CodeIcon, Wand2Icon, LoaderIcon } from "lucide-react";
import { OpenAIProvider } from "@/services/llm-providers/OpenAIProvider";
import { AnthropicProvider } from "@/services/llm-providers/AnthropicProvider";
import { toast } from "@/hooks/use-toast";
import { 
  GenerationPipeline, 
  validateCodeGeneration, 
  extractComponents, 
  extractTypes 
} from "@/lib/generation-pipeline";

const GenerationPipelineExample: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [styleGuide, setStyleGuide] = useState('Tailwind CSS with shadcn/ui');
  const [results, setResults] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('input');
  const [generating, setGenerating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openai');

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a description of what you want to generate",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter an API key for the selected provider",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    setResults({});

    try {
      let llmProvider;
      if (provider === 'openai') {
        llmProvider = new OpenAIProvider({ type: 'openai', apiKey });
      } else {
        llmProvider = new AnthropicProvider({ type: 'anthropic', apiKey });
      }

      const generationFlow = new GenerationPipeline({
        phases: [
          {
            name: 'architecture',
            promptTemplate: `Design a React component architecture for: {userInput}\n\nStyle guide: {styleGuide}\n\nProvide a detailed component breakdown with props interfaces and key functionality described.`,
            temperature: 0.2,
            validation: validateCodeGeneration,
          },
          {
            name: 'implementation',
            promptTemplate: `Generate full TypeScript React code for the following architecture:\n\n{architecture}\n\nRequirements: {userInput}\n\nStyle guide: {styleGuide}\n\nProvide each component in a separate code block with the filename as a comment at the top.`,
            temperature: 0.5,
            validation: validateCodeGeneration,
          },
        ],
        contextBuilder: (prevResults) => ({
          architecture: prevResults['architecture'] || '',
          components: extractComponents(prevResults),
          types: extractTypes(prevResults),
        }),
        debugMode: true,
      });

      generationFlow.registerProviders([llmProvider]);

      const result = await generationFlow.execute({
        userInput,
        styleGuide,
      });

      setResults(result);
      setActiveTab('architecture');
      
      toast({
        title: "Generation Complete",
        description: "Code has been generated successfully"
      });
    } catch (error) {
      console.error("Generation failed:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">AI Code Generation Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This example demonstrates a multi-phase generation pipeline that designs and implements React components.
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="architecture" disabled={!results.architecture}>Architecture</TabsTrigger>
              <TabsTrigger value="implementation" disabled={!results.implementation}>Implementation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="input" className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">AI Provider</label>
                  <div className="flex gap-2">
                    <Button 
                      variant={provider === 'openai' ? "default" : "outline"} 
                      onClick={() => setProvider('openai')}
                      size="sm"
                    >
                      OpenAI
                    </Button>
                    <Button 
                      variant={provider === 'anthropic' ? "default" : "outline"} 
                      onClick={() => setProvider('anthropic')}
                      size="sm"
                    >
                      Anthropic
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter API key for the selected provider"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Component Description</label>
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Describe the React component you want to generate (e.g., A dashboard with real-time metrics, charts, and user activity feed)"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Style Guide</label>
                  <Textarea
                    value={styleGuide}
                    onChange={(e) => setStyleGuide(e.target.value)}
                    placeholder="Specify styling approach (e.g., Tailwind CSS, Material UI, custom CSS)"
                    className="min-h-[60px]"
                  />
                </div>
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Tip</AlertTitle>
                <AlertDescription>
                  Be specific about features, data sources, and interaction patterns for better results.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="architecture" className="py-4">
              {results.architecture && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Architecture Design</h3>
                    <Badge variant="outline">
                      {results.architecture.metadata.provider}
                    </Badge>
                  </div>
                  <Separator />
                  <pre className="p-4 bg-gray-50 rounded-md overflow-auto text-sm whitespace-pre-wrap">
                    {results.architecture.output}
                  </pre>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="implementation" className="py-4">
              {results.implementation && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Component Implementation</h3>
                    <Badge variant="outline">
                      {results.implementation.metadata.provider}
                    </Badge>
                  </div>
                  <Separator />
                  <pre className="p-4 bg-gray-50 rounded-md overflow-auto text-sm whitespace-pre-wrap">
                    {results.implementation.output}
                  </pre>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerate} 
            disabled={generating || !userInput.trim()} 
            className="w-full"
          >
            {generating ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2Icon className="mr-2 h-4 w-4" />
                Generate Components
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GenerationPipelineExample;

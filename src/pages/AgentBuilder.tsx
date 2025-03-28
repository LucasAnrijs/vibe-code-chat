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

    setIsGenerating(true);
    
    try {
      // This would connect to your actual code generation service
      // For demo purposes, we'll simulate a response after a delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockArtifact: CodeArtifact = {
        files: {
          "UserController.ts": `import { Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export class UserController {
  async create(req: Request, res: Response) {
    try {
      const data = UserSchema.parse(req.body);
      const user = await prisma.user.create({ data });
      
      // Generate JWT
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
      
      return res.status(201).json({ user, token });
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
  
  // Other CRUD methods would be implemented here
}`,
          "routes.ts": `import { Router } from 'express';
import { UserController } from './UserController';

const router = Router();
const userController = new UserController();

router.post('/users', userController.create);

export default router;`
        },
        metadata: {
          generatedAt: new Date(),
          providerUsed: providers[0].type,
          stage: "implementation"
        }
      };
      
      setGeneratedCode(mockArtifact);
      toast({
        title: "Code Generated",
        description: "Your agent has successfully generated code based on your specifications."
      });
      
      // Move to the preview tab
      setActiveTab("preview");
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate code. Please check your configuration and try again.",
        variant: "destructive"
      });
      console.error(error);
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


import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Info, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

// Sample architecture templates
const architectureTemplates = {
  basic: `/src
|-- /components
|   |-- Header.tsx
|   |-- Main.tsx
|   |-- Footer.tsx
|-- App.tsx
|-- index.tsx`,
  dashboard: `/src
|-- /components
|   |-- Dashboard.tsx
|   |-- Sidebar.tsx
|   |-- Navbar.tsx
|   |-- /widgets
|       |-- StatsCard.tsx
|       |-- ActivityChart.tsx
|-- /hooks
|   |-- useDashboardData.ts
|-- /utils
|   |-- formatters.ts
|-- /types
|   |-- index.ts
|-- App.tsx
|-- index.tsx`,
  fullstack: `/src
|-- /components
|   |-- PromptDesigner.tsx
|   |-- PromptTemplate.tsx
|   |-- LLMResponseViewer.tsx
|-- /hooks
|   |-- usePromptGeneration.ts
|-- /utils
|   |-- inputHandlers.ts
|   |-- validation.ts
|-- /types
|   |-- index.ts
|-- /services
|   |-- generationService.ts
|   |-- validationService.ts
|-- App.tsx
|-- index.tsx`
};

// Sample database schema templates
const databaseTemplates = {
  user: `// User Schema
type User {
  id: string
  username: string
  email: string
  password: string
  createdAt: Date
  profile: Profile
}

type Profile {
  userId: string
  bio: string
  avatarUrl: string
}`,
  blog: `// Blog Schema
type Post {
  id: string
  title: string
  content: string
  published: boolean
  author: User
  comments: Comment[]
  tags: Tag[]
  createdAt: Date
  updatedAt: Date
}

type User {
  id: string
  name: string
  email: string
  posts: Post[]
}

type Comment {
  id: string
  content: string
  authorId: string
  postId: string
  createdAt: Date
}

type Tag {
  id: string
  name: string
  posts: Post[]
}`,
  ecommerce: `// E-commerce Schema
type Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  categories: Category[]
  reviews: Review[]
  images: string[]
}

type Category {
  id: string
  name: string
  products: Product[]
}

type Review {
  id: string
  rating: number
  comment: string
  userId: string
  productId: string
}

type Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: Date
  updatedAt: Date
}

type OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
}`
};

interface ArchitectureInputProps {
  architecture: string;
  setArchitecture: React.Dispatch<React.SetStateAction<string>>;
  provider: 'openai' | 'anthropic';
  setProvider: React.Dispatch<React.SetStateAction<'openai' | 'anthropic'>>;
}

const ArchitectureInput: React.FC<ArchitectureInputProps> = ({
  architecture,
  setArchitecture,
  provider,
  setProvider
}) => {
  const [template, setTemplate] = React.useState<string>("");
  const [apiKey, setApiKey] = React.useState<string>(
    localStorage.getItem(`${provider}_api_key`) || ""
  );
  const [activeTab, setActiveTab] = useState<string>("architecture");
  const [databaseSchema, setDatabaseSchema] = useState<string>("");
  const [databaseType, setDatabaseType] = useState<string>("prisma");
  const [dbTemplate, setDbTemplate] = useState<string>("");
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Update API key when provider changes
  React.useEffect(() => {
    setApiKey(localStorage.getItem(`${provider}_api_key`) || "");
  }, [provider]);

  // Save API key to localStorage when it changes
  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem(`${provider}_api_key`, value);
  };

  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    if (value && architectureTemplates[value as keyof typeof architectureTemplates]) {
      setArchitecture(architectureTemplates[value as keyof typeof architectureTemplates]);
    }
  };

  const handleDbTemplateChange = (value: string) => {
    setDbTemplate(value);
    if (value && databaseTemplates[value as keyof typeof databaseTemplates]) {
      setDatabaseSchema(databaseTemplates[value as keyof typeof databaseTemplates]);
    }
  };

  const validateSchema = async () => {
    if (!databaseSchema.trim()) {
      toast({
        title: "Schema Required",
        description: "Please provide a database schema before validating.",
        variant: "destructive"
      });
      return;
    }

    const apiKeyValue = localStorage.getItem(`${provider}_api_key`);
    if (!apiKeyValue) {
      toast({
        title: "API Key Required",
        description: `Please set your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key in the provider settings.`,
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    
    try {
      // Store schema in localStorage for the code generation service to use
      localStorage.setItem('database_schema', databaseSchema);
      localStorage.setItem('database_type', databaseType);
      
      // Append database structure to architecture
      const dbFolderStructure = 
        databaseType === 'prisma' ? 
        `\n|-- /prisma
|   |-- schema.prisma
|   |-- migrations
|-- /db
|   |-- client.ts
|   |-- models.ts` : 
        databaseType === 'mongodb' ?
        `\n|-- /db
|   |-- connection.ts
|   |-- models
|       |-- index.ts` :
        `\n|-- /db
|   |-- connection.ts
|   |-- models.ts`;
      
      // Only append if not already present
      if (!architecture.includes('/db') && !architecture.includes('/prisma')) {
        setArchitecture(prev => prev + dbFolderStructure);
      }
      
      toast({
        title: "Schema Validated",
        description: "Database schema has been validated and saved for generation."
      });
      
      // Switch to architecture tab
      setActiveTab("architecture");
    } catch (error) {
      console.error("Schema validation error:", error);
      toast({
        title: "Validation Failed",
        description: "Failed to validate database schema. Please check your inputs and try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="template">Template</Label>
          <Select 
            value={template} 
            onValueChange={handleTemplateChange}
          >
            <SelectTrigger id="template">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom (Empty)</SelectItem>
              <SelectItem value="basic">Basic Application</SelectItem>
              <SelectItem value="dashboard">Dashboard Application</SelectItem>
              <SelectItem value="fullstack">Fullstack Application</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="provider">AI Provider</Label>
          <Select 
            value={provider} 
            onValueChange={(value: 'openai' | 'anthropic') => setProvider(value)}
          >
            <SelectTrigger id="provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          placeholder={`Enter your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key`}
        />
      </div>
      
      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="architecture" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Architecture
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Schema
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="architecture">
          <div className="flex items-start mb-2">
            <Label htmlFor="architecture" className="mt-1">Architecture Structure</Label>
            <div className="bg-amber-50 text-amber-800 text-xs px-2 py-0.5 rounded ml-2 flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Use the directory structure format
            </div>
          </div>
          <Textarea 
            id="architecture"
            placeholder="Enter your project architecture as a directory structure..."
            className="font-mono min-h-[300px]"
            value={architecture}
            onChange={(e) => setArchitecture(e.target.value)}
          />
          
          <div className="text-sm text-gray-500 p-3 bg-gray-100 rounded-md mt-4">
            <p className="font-semibold mb-1">Format Guide:</p>
            <p>Use the directory structure format:</p>
            <pre className="text-xs bg-gray-200 p-2 rounded mt-1 overflow-x-auto">
{`/src
|-- /components
|   |-- Component1.tsx
|   |-- Component2.tsx
|-- App.tsx
|-- index.tsx`}
            </pre>
          </div>
        </TabsContent>
        
        <TabsContent value="database">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dbTemplate">Database Template</Label>
                <Select 
                  value={dbTemplate} 
                  onValueChange={handleDbTemplateChange}
                >
                  <SelectTrigger id="dbTemplate">
                    <SelectValue placeholder="Select a database template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom (Empty)</SelectItem>
                    <SelectItem value="user">User Management</SelectItem>
                    <SelectItem value="blog">Blog System</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="dbType">Database Type</Label>
                <Select 
                  value={databaseType} 
                  onValueChange={setDatabaseType}
                >
                  <SelectTrigger id="dbType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prisma">Prisma (SQL)</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                    <SelectItem value="typeorm">TypeORM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <div className="flex items-start mb-2">
                <Label htmlFor="schema" className="mt-1">Database Schema</Label>
                <div className="bg-blue-50 text-blue-800 text-xs px-2 py-0.5 rounded ml-2 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  Define your data models
                </div>
              </div>
              <Textarea 
                id="schema"
                placeholder="Define your database schema using type definitions..."
                className="font-mono min-h-[300px]"
                value={databaseSchema}
                onChange={(e) => setDatabaseSchema(e.target.value)}
              />
            </div>
            
            <div className="text-sm text-gray-500 p-3 bg-gray-100 rounded-md">
              <p className="font-semibold mb-1">Schema Format Guide:</p>
              <p>Define your data models with types and relationships:</p>
              <pre className="text-xs bg-gray-200 p-2 rounded mt-1 overflow-x-auto">
{`type User {
  id: string
  name: string
  email: string
  posts: Post[]
}

type Post {
  id: string
  title: string
  content: string
  author: User
}`}
              </pre>
            </div>
            
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full mt-4"
              onClick={validateSchema}
              disabled={isValidating}
            >
              {isValidating ? "Validating..." : "Validate & Add to Architecture"}
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArchitectureInput;

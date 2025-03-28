
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Info } from "lucide-react";

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
              <SelectItem value="">Custom (Empty)</SelectItem>
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
      
      <div>
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
      </div>
      
      <div className="text-sm text-gray-500 p-3 bg-gray-100 rounded-md">
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
    </div>
  );
};

export default ArchitectureInput;


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProviderConfig, ProviderType } from "@/lib/agent-types";
import { Trash2, Plus, Server } from "lucide-react";

interface AgentConfigurationProps {
  providers: ProviderConfig[];
  onAddProvider: (provider: ProviderConfig) => void;
  onRemoveProvider: (index: number) => void;
}

const AgentConfiguration = ({ 
  providers, 
  onAddProvider, 
  onRemoveProvider 
}: AgentConfigurationProps) => {
  const [newProvider, setNewProvider] = useState<ProviderConfig>({
    type: "openai",
    apiKey: "",
    endpoint: "",
    rateLimit: 10
  });

  const handleAddProvider = () => {
    if (!newProvider.apiKey) {
      return;
    }
    
    onAddProvider({...newProvider});
    
    // Reset form
    setNewProvider({
      type: "openai",
      apiKey: "",
      endpoint: "",
      rateLimit: 10
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Add AI Provider</h3>
        
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <Label htmlFor="provider-type">Provider Type</Label>
            <Select 
              value={newProvider.type} 
              onValueChange={(value: ProviderType) => setNewProvider({...newProvider, type: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="local">Local Model</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="api-key">API Key</Label>
            <Input 
              id="api-key" 
              type="password" 
              value={newProvider.apiKey}
              onChange={(e) => setNewProvider({...newProvider, apiKey: e.target.value})}
              placeholder="Enter API key"
            />
          </div>
          
          <div>
            <Label htmlFor="endpoint">Endpoint (Optional)</Label>
            <Input 
              id="endpoint" 
              value={newProvider.endpoint || ""}
              onChange={(e) => setNewProvider({...newProvider, endpoint: e.target.value})}
              placeholder="Custom endpoint URL"
            />
          </div>
          
          <div>
            <Label htmlFor="rate-limit">Rate Limit</Label>
            <Input 
              id="rate-limit" 
              type="number" 
              value={newProvider.rateLimit || 10}
              onChange={(e) => setNewProvider({...newProvider, rateLimit: Number(e.target.value)})}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleAddProvider}
            disabled={!newProvider.apiKey}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Configured Providers</h3>
        
        {providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 border rounded-md">
            <Server className="h-12 w-12 mb-4 opacity-50" />
            <p>No providers configured yet</p>
            <p className="text-sm">Add an AI provider to get started with code generation</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium capitalize">
                      {provider.type} Provider
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onRemoveProvider(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    API Key: •••••••••••{provider.apiKey.slice(-4)}
                  </div>
                  {provider.endpoint && (
                    <div className="text-sm text-gray-500 truncate" title={provider.endpoint}>
                      Endpoint: {provider.endpoint}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    Rate Limit: {provider.rateLimit}/min
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentConfiguration;

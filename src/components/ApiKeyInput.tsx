
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyInput = ({ onApiKeySubmit }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
      toast.success("API key saved. You can now chat with the AI!");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4">
      <h3 className="text-sm font-medium mb-2">Enter your OpenAI API Key</h3>
      <p className="text-xs text-gray-500 mb-3">
        Your API key is stored locally in your browser and never sent to our servers.
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <Input
            type={isVisible ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="pr-20"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? "Hide" : "Show"}
          </Button>
        </div>
        <Button type="submit" size="sm" className="w-full bg-vibe-purple hover:bg-vibe-purple/90">
          Save API Key
        </Button>
      </form>
    </div>
  );
};

export default ApiKeyInput;

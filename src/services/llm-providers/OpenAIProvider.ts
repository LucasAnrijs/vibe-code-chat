
import { LLMProvider, ProviderConfig, PromptBlueprint, PromptChunk } from "@/lib/agent-types";
import { toast } from "@/hooks/use-toast";

export class OpenAIProvider extends LLMProvider {
  constructor(config: ProviderConfig) {
    super(config);
  }

  async initialize(): Promise<void> {
    // Verify API key works by making a minimal test call
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          "Authorization": `Bearer ${this.config.apiKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to initialize OpenAI provider");
      }
      
      console.log("OpenAI provider initialized successfully");
    } catch (error) {
      console.error("OpenAI initialization error:", error);
      toast({
        title: "OpenAI Initialization Failed",
        description: "Could not connect to OpenAI API. Please check your API key.",
        variant: "destructive"
      });
      throw error;
    }
  }

  async *generate(prompt: PromptBlueprint): AsyncGenerator<PromptChunk> {
    const endpoint = this.config.endpoint || "https://api.openai.com/v1/chat/completions";

    try {
      const fullPrompt = this.formatPrompt(prompt);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a specialized code generation assistant. Generate clean, maintainable code that follows best practices."
            },
            {
              role: "user", 
              content: fullPrompt
            }
          ],
          temperature: 0.2,
          max_tokens: 2000,
          stream: false, // Streaming would be better but requires more complex handling
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "OpenAI API error");
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Yield the entire response as a single chunk
      // In a production system, we would use streaming for better UX
      yield {
        content,
        metadata: {
          model: data.model,
          provider: "openai",
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("OpenAI generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate code with OpenAI. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  }

  validateResponse(response: unknown): boolean {
    // Basic validation - should be enhanced for production
    if (typeof response !== 'string' || response.length < 10) {
      return false;
    }
    
    // Check if response contains code blocks
    return response.includes('```') || 
           response.includes('class ') || 
           response.includes('function ') || 
           response.includes('const ') || 
           response.includes('import ');
  }

  private formatPrompt(prompt: PromptBlueprint): string {
    let formattedPrompt = `# ${prompt.stage.toUpperCase()} STAGE\n\n`;
    formattedPrompt += `## Context\n${prompt.context}\n\n`;
    
    if (prompt.requirements.length > 0) {
      formattedPrompt += "## Requirements\n";
      prompt.requirements.forEach((req, index) => {
        formattedPrompt += `${index + 1}. ${req}\n`;
      });
      formattedPrompt += "\n";
    }
    
    if (Object.keys(prompt.constraints).length > 0) {
      formattedPrompt += "## Constraints\n";
      Object.entries(prompt.constraints).forEach(([key, value]) => {
        if (value) {
          formattedPrompt += `- ${key}: ${JSON.stringify(value)}\n`;
        }
      });
    }
    
    return formattedPrompt;
  }
}

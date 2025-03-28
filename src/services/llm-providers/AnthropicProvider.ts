
import { LLMProvider, ProviderConfig, PromptBlueprint, PromptChunk } from "@/lib/agent-types";
import { toast } from "@/hooks/use-toast";

export class AnthropicProvider extends LLMProvider {
  constructor(config: ProviderConfig) {
    super(config);
  }

  async initialize(): Promise<void> {
    // Anthropic doesn't have a simple endpoint to check API validity
    // So we'll just log initialization and assume it's valid until first usage
    console.log("Anthropic provider initialized");
  }

  async *generate(prompt: PromptBlueprint): AsyncGenerator<PromptChunk> {
    const endpoint = this.config.endpoint || "https://api.anthropic.com/v1/messages";

    try {
      const fullPrompt = this.formatPrompt(prompt);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          system: "You are a specialized code generation assistant. Generate clean, maintainable code that follows best practices.",
          messages: [
            {
              role: "user",
              content: fullPrompt
            }
          ],
          max_tokens: prompt.constraints.maxTokens ?? 2000,
          temperature: prompt.constraints.temperature ?? 0.2
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Anthropic API error");
      }

      const data = await response.json();
      const content = data.content[0].text;
      
      yield {
        content,
        metadata: {
          model: data.model,
          provider: "anthropic",
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("Anthropic generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate code with Anthropic. Please try again.",
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

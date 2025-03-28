
import { toast } from "@/hooks/use-toast";
import { GithubRepo } from "@/services/githubService";
import { retrieveRelevantContext } from "@/services/ragService";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export const chatWithLLM = async (
  messages: ChatMessage[],
  apiKey: string,
  repo?: GithubRepo,
  query?: string
): Promise<string> => {
  try {
    // If we have repo and query, retrieve relevant context
    let enhancedMessages = [...messages];
    
    if (repo && query) {
      const context = retrieveRelevantContext(repo, query);
      
      // Add context to system message or create a new one
      const systemMessageIndex = enhancedMessages.findIndex(msg => msg.role === "system");
      
      if (systemMessageIndex >= 0) {
        enhancedMessages[systemMessageIndex] = {
          ...enhancedMessages[systemMessageIndex],
          content: `${enhancedMessages[systemMessageIndex].content}\n\nRepository context:\n${context}`
        };
      } else {
        // Insert a new system message at the beginning
        enhancedMessages.unshift({
          role: "system",
          content: `You are a helpful assistant with context from the repository.\n\nRepository context:\n${context}`
        });
      }
    }
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: enhancedMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to get response");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("LLM API error:", error);
    toast({
      title: "API Error",
      description: "Failed to get a response from the AI",
      variant: "destructive"
    });
    return "Sorry, I encountered an error. Please try again later or check your API key.";
  }
};

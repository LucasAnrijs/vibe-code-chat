
import { toast } from "@/hooks/use-toast";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export const chatWithLLM = async (
  messages: ChatMessage[],
  apiKey: string
): Promise<string> => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages.map(msg => ({
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

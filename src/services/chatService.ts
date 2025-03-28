
import { toast } from "sonner";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSessionState {
  messages: ChatMessage[];
  isLoading: boolean;
}

// For demo purposes, we're using a simple OpenAI-like endpoint
// In a production app, you would want to use environment variables
const API_ENDPOINT = "https://api.openai.com/v1/chat/completions";

export const chatWithLLM = async (
  messages: ChatMessage[],
  apiKey: string
): Promise<string> => {
  try {
    const response = await fetch(API_ENDPOINT, {
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
    console.error("Chat API error:", error);
    toast.error("Failed to get a response from the AI");
    return "Sorry, I encountered an error. Please try again later.";
  }
};

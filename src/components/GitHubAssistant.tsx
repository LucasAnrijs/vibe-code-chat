
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot, Send, Copy, FileCode, Key } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { chatWithLLM, ChatMessage } from "@/services/llmService";
import ApiKeyInput from "@/components/ApiKeyInput";
import { GithubRepo } from "@/services/githubService";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  code?: string;
}

interface GitHubAssistantProps {
  repoName: string;
  currentFile: string | null;
  fileContent?: string | null;
  repo?: GithubRepo;
}

const GitHubAssistant = ({ repoName, currentFile, fileContent, repo }: GitHubAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with system message when component mounts or when context changes
  useEffect(() => {
    const systemMessage: Message = {
      role: "system",
      content: `You are an expert code editor and GitHub assistant for the ${repoName || "repository"}. 
You can help users make changes to their code, generate new components, refactor existing code, and provide best practices.
You'll have access to the current file content to provide contextual assistance.
Keep your answers focused on programming, technical solutions, and React/TypeScript best practices.
The repository you're helping with is: ${repoName || "Not specified"}.
${currentFile ? `The current file you're working with is: ${currentFile}` : "No file is currently selected."}`,
    };

    const welcomeMessage: Message = {
      role: "assistant",
      content: `Hello! I'm your GitHub code assistant, ready to help with ${repoName || "your repository"}. ${
        currentFile 
          ? `I can see you're looking at \`${currentFile}\`. How can I help you modify or understand this file?` 
          : "Select a file from the repository explorer, and I can help you understand or modify it."
      }`,
    };

    setMessages([systemMessage, welcomeMessage]);
  }, [repoName, currentFile]);

  // Load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to update system message when file content changes
  useEffect(() => {
    if (fileContent && messages.length > 0) {
      // Update the system message with file content
      const updatedMessages = [...messages];
      if (updatedMessages[0].role === "system") {
        updatedMessages[0] = {
          ...updatedMessages[0],
          content: `${updatedMessages[0].content}\n\nCurrent file content:\n\`\`\`${currentFile?.split('.').pop() || 'tsx'}\n${fileContent}\n\`\`\``,
        };
        setMessages(updatedMessages);
      }
    }
  }, [fileContent, currentFile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem("openai_api_key", key);
    setApiKey(key);
    setShowApiKeyInput(false);
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved for this session.",
    });
  };

  const generateReactComponent = (componentName: string): string => {
    return `import React from "react";
import { Card } from "@/components/ui/card";

interface ${componentName}Props {
  title?: string;
}

const ${componentName} = ({ title = "Default Title" }: ${componentName}Props) => {
  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p>This is the ${componentName} component.</p>
    </Card>
  );
};

export default ${componentName};`;
  };

  const generateReactPage = (pageName: string): string => {
    return `import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const ${pageName} = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">${pageName}</h1>
            
            <Card className="p-6">
              <p>This is the ${pageName} page content.</p>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ${pageName};`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => prev.filter(msg => msg.role !== "system").concat([userMessage]));
    setInput("");
    setIsLoading(true);

    try {
      // Check for component generation requests first (without LLM)
      const componentMatch = input.match(/generate(?:\sa)?(?:\sreact)?(?:\scomponent)?\s+(?:called|named)?\s*([A-Z][a-zA-Z]+)/i);
      const pageMatch = input.match(/generate(?:\sa)?(?:\sreact)?(?:\spage)?\s+(?:called|named)?\s*([A-Z][a-zA-Z]+)/i);
      
      if (input.toLowerCase().includes("generate") && input.toLowerCase().includes("component") && componentMatch) {
        const componentName = componentMatch[1];
        const code = generateReactComponent(componentName);
        const response = `Here's a basic React component named ${componentName}. You can copy this code and save it to a new file called ${componentName}.tsx:`;
        
        const assistantMessage: Message = { role: "assistant", content: response, code };
        setMessages((prev) => prev.filter(msg => msg.role !== "system").concat([assistantMessage]));
      }
      else if (input.toLowerCase().includes("generate") && input.toLowerCase().includes("page") && pageMatch) {
        const pageName = pageMatch[1];
        const code = generateReactPage(pageName);
        const response = `Here's a basic React page named ${pageName}. You can copy this code and save it to a new file called ${pageName}.tsx in your pages directory:`;
        
        const assistantMessage: Message = { role: "assistant", content: response, code };
        setMessages((prev) => prev.filter(msg => msg.role !== "system").concat([assistantMessage]));
      }
      else if (apiKey) {
        // Use LLM for more complex requests
        const systemMessage = messages.find(msg => msg.role === "system");
        const messagesToSend = systemMessage ? [systemMessage] : [];
        
        // Add only the last 10 messages to avoid token limits
        const conversationMessages = messages
          .filter(msg => msg.role !== "system")
          .slice(-10);
        
        messagesToSend.push(...conversationMessages);
        messagesToSend.push(userMessage);
        
        // Convert our internal message format to the format expected by the llmService
        const chatMessages: ChatMessage[] = messagesToSend.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // Use enhanced chatWithLLM with RAG support
        const response = await chatWithLLM(
          chatMessages, 
          apiKey,
          repo,  // Pass the repo for RAG context
          input   // Pass the user query for relevant document retrieval
        );
        
        // Check if response contains code block
        let content = response;
        let code: string | undefined = undefined;
        
        // Extract code blocks if present
        const codeBlockRegex = /```(?:jsx|tsx|javascript|typescript|js|ts)?\s*\n([\s\S]*?)```/g;
        const matches = [...response.matchAll(codeBlockRegex)];
        
        if (matches.length > 0) {
          // Get the largest code block
          const largestMatch = matches.reduce((largest, current) => 
            current[1].length > largest[1].length ? current : largest
          , matches[0]);
          
          code = largestMatch[1].trim();
          
          // Remove the code block from the content
          content = response.replace(codeBlockRegex, '').trim();
          
          if (!content) {
            content = "Here's the code you requested:";
          }
        }
        
        const assistantMessage: Message = { role: "assistant", content, code };
        setMessages((prev) => prev.filter(msg => msg.role !== "system").concat([assistantMessage]));
      } else {
        // Handle case where no API key is available
        setMessages((prev) => prev.filter(msg => msg.role !== "system").concat([{
          role: "assistant",
          content: "To use the AI-powered code assistant, please provide an OpenAI API key. For now, I can still generate basic components and pages for you - just ask me to generate a component or page."
        }]));
        
        // Show API key input form
        setShowApiKeyInput(true);
      }
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again or check your API key.",
        variant: "destructive",
      });
      
      setMessages((prev) => prev.filter(msg => msg.role !== "system").concat([{
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again or check your API key."
      }]));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text copied to clipboard",
    });
  };

  return (
    <Card className="flex flex-col h-full border rounded-md bg-white overflow-hidden">
      <div className="flex items-center justify-between bg-gray-50 p-2 border-b">
        <div className="flex items-center">
          <Bot size={18} className="text-vibe-purple mr-2" />
          <h3 className="text-sm font-medium">GitHub Code Assistant</h3>
        </div>
        {apiKey ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-7 px-2"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          >
            <Key size={14} className="mr-1" />
            Change API Key
          </Button>
        ) : !showApiKeyInput && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-7 px-2"
            onClick={() => setShowApiKeyInput(true)}
          >
            <Key size={14} className="mr-1" />
            Set API Key
          </Button>
        )}
      </div>

      {showApiKeyInput && (
        <div className="p-4 border-b">
          <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
        </div>
      )}

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.filter(msg => msg.role !== "system").map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-vibe-purple text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                  
                  {message.code && (
                    <div className="mt-4">
                      <div className="bg-gray-800 text-white p-2 rounded-t-md flex justify-between items-center">
                        <div className="flex items-center">
                          <FileCode size={14} className="mr-1" />
                          <span className="text-xs">Generated Code</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-300 hover:text-white"
                          onClick={() => copyToClipboard(message.code || "")}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                      <pre className="bg-gray-900 text-gray-200 p-3 rounded-b-md overflow-x-auto text-xs">
                        <code>{message.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
                {message.role === "assistant" && !message.code && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2 -mr-1 -mt-1 text-gray-500 hover:text-gray-700"
                    onClick={() => copyToClipboard(message.content)}
                  >
                    <Copy size={14} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="relative flex-grow">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={apiKey ? "Ask me about the code or request changes..." : "Set API key to use AI features, or ask for component generation..."}
              className="min-h-[60px] resize-none pr-10"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute right-3 bottom-3 text-gray-400">
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="text-xs border rounded px-1">⏎</div>
              )}
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`${
              isLoading ? "opacity-70" : ""
            } bg-vibe-purple hover:bg-vibe-purple/90`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                <span>Thinking...</span>
              </div>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Send
              </>
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default GitHubAssistant;

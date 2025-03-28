
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot, Send, Copy, MessageSquare, CornerDownLeft, Code, FileCode } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  code?: string;
}

interface GitHubAssistantProps {
  repoName: string;
  currentFile: string | null;
}

const GitHubAssistant = ({ repoName, currentFile }: GitHubAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm your GitHub assistant. I can help you make changes to the ${repoName || "repository"} and generate code for new components or pages. How can I assist you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate AI processing (in a real app, this would call an API)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate a response based on the current context
      let response = "";
      let code: string | undefined = undefined;
      
      // Check for component generation requests
      const componentMatch = input.match(/generate(?:\sa)?(?:\sreact)?(?:\scomponent)?\s+(?:called|named)?\s*([A-Z][a-zA-Z]+)/i);
      const pageMatch = input.match(/generate(?:\sa)?(?:\sreact)?(?:\spage)?\s+(?:called|named)?\s*([A-Z][a-zA-Z]+)/i);
      
      if (input.toLowerCase().includes("generate") && input.toLowerCase().includes("component")) {
        const componentName = componentMatch ? componentMatch[1] : "NewComponent";
        code = generateReactComponent(componentName);
        response = `Here's a basic React component named ${componentName}. You can copy this code and save it to a new file called ${componentName}.tsx:`;
      }
      else if (input.toLowerCase().includes("generate") && input.toLowerCase().includes("page")) {
        const pageName = pageMatch ? pageMatch[1] : "NewPage";
        code = generateReactPage(pageName);
        response = `Here's a basic React page named ${pageName}. You can copy this code and save it to a new file called ${pageName}.tsx in your pages directory:`;
      }
      else if (input.toLowerCase().includes("change") || input.toLowerCase().includes("modify") || input.toLowerCase().includes("update")) {
        if (currentFile) {
          response = `To change the ${currentFile} file:\n\n1. Make your changes in the editor\n2. Click the Save button at the top\n3. Add a meaningful commit message\n4. Confirm the changes`;
        } else {
          response = "Please select a file from the repository explorer first, then I can help you make changes to it.";
        }
      } else if (input.toLowerCase().includes("add") || input.toLowerCase().includes("create")) {
        if (input.toLowerCase().includes("component")) {
          const componentName = "MyComponent";
          code = generateReactComponent(componentName);
          response = `Here's a template for a new React component. You can customize it as needed:`;
        } else if (input.toLowerCase().includes("page")) {
          const pageName = "MyPage";
          code = generateReactPage(pageName);
          response = `Here's a template for a new React page. Remember to add it to your router configuration:`;
        } else {
          response = "To add a new file:\n\n1. This is currently not supported in the editor, but you can:\n   - Clone the repository locally\n   - Add the file\n   - Push the changes\n   - Refresh the repository in this interface";
        }
      } else if (input.toLowerCase().includes("delete") || input.toLowerCase().includes("remove")) {
        response = "File deletion is not currently supported in this interface. You can:\n\n1. Clone the repository locally\n2. Delete the file\n3. Push the changes\n4. Refresh the repository in this interface";
      } else if (input.toLowerCase().includes("hello") || input.toLowerCase().includes("hi")) {
        response = `Hello! I'm your GitHub assistant. I can help you navigate and make changes to the ${repoName || "repository"}. I can also generate code for new React components and pages. Just ask me to generate a component or page!`;
      } else {
        response = `I'm here to help you with the ${repoName || "repository"}. You can ask me to:\n\n- Generate a new React component or page\n- Make changes to a file\n- Navigate the repository\n- Save changes\n\nFor example, try asking:\n- "Generate a component called UserProfile"\n- "Generate a page called Dashboard"`;
      }

      // Add assistant message
      const assistantMessage: Message = { role: "assistant", content: response, code };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      });
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
          <h3 className="text-sm font-medium">GitHub Assistant</h3>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
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
              placeholder="Ask about making changes or generating components..."
              className="min-h-[60px] resize-none pr-10"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute right-3 bottom-3 text-gray-400">
              <CornerDownLeft size={16} />
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

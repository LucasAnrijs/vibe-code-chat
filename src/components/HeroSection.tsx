
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, GraduationCap, ArrowRight } from "lucide-react";
import ChatMessageComponent from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ApiKeyInput from "@/components/ApiKeyInput";
import CodeSnippetTester from "@/components/CodeSnippetTester";
import { chatWithLLM, type ChatMessage as ChatMessageType } from "@/services/chatService";

const HeroSection = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      role: "assistant",
      content: "Let's learn how to create a function in JavaScript. What's your coding experience?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem("openai_api_key", key);
    setApiKey(key);
  };

  const handleSendMessage = async (content: string) => {
    if (!apiKey) return;
    
    // Add user message to chat
    const userMessage: ChatMessageType = { role: "user", content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Create a copy of messages for the API call
      const messageHistory = [...messages, userMessage];
      
      // Get response from LLM
      const response = await chatWithLLM(messageHistory, apiKey);
      
      // Add assistant response to chat
      const assistantMessage: ChatMessageType = { role: "assistant", content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-vibe-dark">
              Learn to code with the <span className="text-vibe-purple">perfect vibe</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Master coding through friendly chat interactions. It&apos;s like texting with a patient mentor who&apos;s always ready to help you grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button size="lg" className="bg-vibe-purple hover:bg-vibe-purple/90 text-white px-8">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="border-vibe-purple text-vibe-purple hover:bg-vibe-purple hover:text-white">
                See Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-500 pt-4">No credit card required</div>
          </div>

          <div className="flex-1 relative flex flex-col md:flex-row gap-6 items-center justify-center">
            {/* Chat Component */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-md w-full transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="ml-2 text-sm font-medium text-gray-500">chat.vibecode.io</div>
              </div>
              
              {!apiKey && <ApiKeyInput onApiKeySubmit={handleSaveApiKey} />}
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto mb-4">
                {messages.map((message, index) => (
                  <ChatMessageComponent key={index} message={message} />
                ))}
                
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="bg-vibe-purple text-white p-2 rounded-full shadow-md">
                      <GraduationCap size={20} />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 text-sm max-w-[80%] shadow-sm">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <ChatInput 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
                placeholder={apiKey ? "Ask about JavaScript..." : "Enter API key first..."}
                autoFocus={!!apiKey}
              />
              
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-vibe-purple text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                Interactive Chat
              </div>
            </div>

            {/* Code Snippet Tester */}
            <CodeSnippetTester />
            
            <div className="hidden lg:block absolute -z-10 right-5 -bottom-10 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-70"></div>
            <div className="hidden lg:block absolute -z-10 right-20 -top-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-70"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

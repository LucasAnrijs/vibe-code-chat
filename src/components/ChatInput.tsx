
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

const ChatInput = ({ onSendMessage, isLoading, placeholder = "Type your message...", autoFocus = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="h-10 bg-gray-100 rounded-full flex items-center pl-4 pr-12 shadow-inner">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          autoFocus={autoFocus}
          className="bg-transparent w-full focus:outline-none text-sm"
        />
      </div>
      <Button 
        type="submit" 
        size="icon" 
        variant="ghost" 
        disabled={isLoading || !message.trim()}
        className="absolute right-1 top-1/2 transform -translate-y-1/2 text-vibe-purple hover:bg-transparent"
      >
        <ArrowRight size={18} />
      </Button>
    </form>
  );
};

export default ChatInput;

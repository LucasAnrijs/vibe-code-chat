
import { MessageCircle, GraduationCap } from "lucide-react";
import { type ChatMessage as ChatMessageType } from "@/services/chatService";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  // Helper function to format code blocks
  const formatContent = (content: string) => {
    // Simple regex to detect code blocks (text between ```backticks```)
    const codeBlockRegex = /```([^`]*?)```/gs;
    
    if (!codeBlockRegex.test(content)) {
      return <p>{content}</p>;
    }

    const segments = [];
    let lastIndex = 0;
    let match;
    
    // Reset regex index
    codeBlockRegex.lastIndex = 0;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        segments.push(
          <p key={`text-${lastIndex}`}>{content.slice(lastIndex, match.index)}</p>
        );
      }
      
      // Add code block
      segments.push(
        <pre key={`code-${match.index}`} className="bg-gray-800 text-green-400 p-2 rounded mt-2 mb-2 overflow-x-auto">
          {match[1].trim()}
        </pre>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text after the last code block
    if (lastIndex < content.length) {
      segments.push(
        <p key={`text-${lastIndex}`}>{content.slice(lastIndex)}</p>
      );
    }
    
    return <>{segments}</>;
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="bg-vibe-purple text-white p-2 rounded-full shadow-md">
          <GraduationCap size={20} />
        </div>
      )}
      
      <div className={`rounded-lg p-3 text-sm max-w-[80%] shadow-sm ${isUser ? "bg-gray-100" : "bg-gray-100"}`}>
        {formatContent(message.content)}
      </div>
      
      {isUser && (
        <div className="bg-gray-200 text-gray-800 p-2 rounded-full shadow-md">
          <MessageCircle size={20} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;

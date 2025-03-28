
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Code, Play } from "lucide-react";
import { toast } from "sonner";

const CodeSnippetTester = () => {
  const [code, setCode] = useState<string>("// Type your JavaScript code here\nconsole.log('Hello, world!');");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput("");
    
    try {
      // Create a safe output capture function
      const originalConsoleLog = console.log;
      const capturedOutput: string[] = [];
      
      // Override console.log to capture output
      console.log = (...args) => {
        capturedOutput.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));
        originalConsoleLog(...args);
      };
      
      // Execute the code in a try-catch block
      // eslint-disable-next-line no-new-func
      const result = new Function(code)();
      
      // Restore original console.log
      console.log = originalConsoleLog;
      
      // Update the output
      setOutput(capturedOutput.join('\n') + (result !== undefined ? '\n=> ' + result : ''));
      toast.success("Code executed successfully!");
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
      toast.error("Error in code execution");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-md transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <div className="ml-2 text-sm font-medium text-gray-500">code.vibecode.io</div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Code size={16} className="text-vibe-purple" />
          <h3 className="text-sm font-medium">Code Playground</h3>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-32 p-3 text-sm font-mono bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vibe-purple/50"
          spellCheck="false"
          disabled={isRunning}
        />
      </div>
      
      <div className="mb-4">
        <Button
          onClick={handleRunCode}
          disabled={isRunning}
          className="w-full bg-vibe-purple hover:bg-vibe-purple/90 text-white"
        >
          <Play size={16} className="mr-2" />
          Run Code
        </Button>
      </div>
      
      <div>
        <div className="text-xs text-gray-500 mb-1">Output:</div>
        <pre className="w-full h-24 p-3 text-xs font-mono bg-gray-100 border border-gray-300 rounded-md overflow-auto">
          {output || "// Code output will appear here"}
        </pre>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Note: Only basic JavaScript is supported. No external libraries.
      </div>
    </div>
  );
};

export default CodeSnippetTester;

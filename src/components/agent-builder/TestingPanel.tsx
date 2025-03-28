
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { CodeArtifact } from "@/lib/agent-types";
import { Play, RotateCw, Check, X, Save, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TestingPanelProps {
  artifact: CodeArtifact | null;
}

const TestingPanel = ({ artifact }: TestingPanelProps) => {
  const [testInput, setTestInput] = useState("");
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const runTest = async () => {
    if (!artifact || !testInput) return;
    
    setIsRunning(true);
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock results
      const success = Math.random() > 0.3;
      
      setTestResults({
        success,
        output: success 
          ? { id: 1, name: "Test User", email: "test@example.com" }
          : null,
        errors: success ? [] : ["Email validation failed"],
        executionTime: Math.floor(Math.random() * 500) + 100,
      });
      
      toast({
        title: success ? "Test Passed" : "Test Failed",
        description: success 
          ? "Your code executed successfully with the test input." 
          : "The test execution failed. Check the error details.",
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Test Error",
        description: "An error occurred while running the test.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const saveAgent = async () => {
    if (!artifact || !agentName) return;
    
    setIsSaving(true);
    
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Agent Saved",
        description: `"${agentName}" has been saved successfully.`
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save the agent. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Input</CardTitle>
            <CardDescription>
              Provide sample input to test your generated code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={`{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}`}
              className="font-mono min-h-[200px]"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={runTest} 
              disabled={isRunning || !testInput || !artifact}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  Running Test...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Test
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Execution results and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testResults ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-full ${testResults.success ? 'bg-green-100' : 'bg-red-100'}`}>
                    {testResults.success ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <span className="font-medium">
                    {testResults.success ? "Test Passed" : "Test Failed"}
                  </span>
                </div>
                
                {testResults.errors.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-md border border-red-200 text-red-800 text-sm">
                    <h4 className="font-medium mb-1">Errors:</h4>
                    <ul className="list-disc pl-5">
                      {testResults.errors.map((error: string, i: number) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {testResults.output && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Output:</h4>
                    <pre className="bg-gray-100 p-3 rounded-md text-xs font-mono overflow-auto max-h-[160px]">
                      {JSON.stringify(testResults.output, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div className="text-sm text-gray-500">
                  Execution time: {testResults.executionTime}ms
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-center text-gray-500">
                <RotateCw className="h-12 w-12 mb-4 opacity-25" />
                <p>No test results yet</p>
                <p className="text-sm">Run a test to see results here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Save & Deploy</CardTitle>
          <CardDescription>
            Save your agent configuration for future use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                placeholder="E.g., User API Generator"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={saveAgent} 
                disabled={isSaving || !agentName || !artifact}
              >
                {isSaving ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Agent
                  </>
                )}
              </Button>
              
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Export Configuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingPanel;

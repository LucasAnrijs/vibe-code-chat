
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Code, Wand2 } from "lucide-react";

interface PromptDesignerProps {
  prompt: {
    specification: string;
    architecture: string;
    constraints: string[];
  };
  setPrompt: React.Dispatch<React.SetStateAction<{
    specification: string;
    architecture: string;
    constraints: string[];
  }>>;
  onGenerateCode: () => void;
  isGenerating: boolean;
}

const PromptDesigner = ({ 
  prompt, 
  setPrompt, 
  onGenerateCode,
  isGenerating
}: PromptDesignerProps) => {
  const addConstraint = () => {
    setPrompt({
      ...prompt,
      constraints: [...prompt.constraints, ""]
    });
  };

  const removeConstraint = (index: number) => {
    const newConstraints = [...prompt.constraints];
    newConstraints.splice(index, 1);
    setPrompt({
      ...prompt,
      constraints: newConstraints
    });
  };

  const updateConstraint = (index: number, value: string) => {
    const newConstraints = [...prompt.constraints];
    newConstraints[index] = value;
    setPrompt({
      ...prompt,
      constraints: newConstraints
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="specification">Specification</Label>
        <Textarea
          id="specification"
          placeholder="Describe the component you want to generate (e.g., CRUD API for user profiles)"
          className="min-h-[100px]"
          value={prompt.specification}
          onChange={(e) => setPrompt({...prompt, specification: e.target.value})}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="architecture">Architecture (Optional)</Label>
        <Textarea
          id="architecture"
          placeholder="Describe the preferred architecture (e.g., REST service with Prisma ORM)"
          value={prompt.architecture}
          onChange={(e) => setPrompt({...prompt, architecture: e.target.value})}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Constraints</Label>
        <div className="space-y-2">
          {prompt.constraints.map((constraint, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={constraint}
                onChange={(e) => updateConstraint(index, e.target.value)}
                placeholder="Add constraint (e.g., Use Zod for validation)"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => removeConstraint(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addConstraint}
            className="mt-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Constraint
          </Button>
        </div>
      </div>
      
      <div className="pt-4 flex justify-center">
        <Button 
          onClick={onGenerateCode} 
          disabled={isGenerating || !prompt.specification}
          className="w-full sm:w-auto"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Generate Code
            </>
          )}
        </Button>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
        <div className="flex items-start">
          <Code className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium">Prompt Tips</h4>
            <ul className="text-sm mt-1 space-y-1 list-disc pl-5">
              <li>Be specific about functionality requirements</li>
              <li>Mention important libraries or frameworks</li>
              <li>Specify programming patterns when relevant</li>
              <li>Include error handling expectations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptDesigner;

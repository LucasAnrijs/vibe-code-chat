
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Lock, Circle, ArrowRight } from "lucide-react";

interface PathNode {
  id: string;
  title: string;
  completed: boolean;
  locked: boolean;
}

const paths: PathNode[] = [
  { id: "basics", title: "React Basics", completed: true, locked: false },
  { id: "components", title: "Component Design", completed: true, locked: false },
  { id: "state", title: "State Management", completed: false, locked: false },
  { id: "hooks", title: "Advanced Hooks", completed: false, locked: true },
  { id: "ai-integration", title: "AI Integration", completed: false, locked: true },
  { id: "rag-systems", title: "RAG Systems", completed: false, locked: true },
];

const ProgressPath: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Learning Progress Path</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {paths.map((node, index) => (
            <React.Fragment key={node.id}>
              <div className="flex flex-col items-center min-w-[100px]">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2
                    ${node.completed 
                      ? "bg-green-100 text-green-600" 
                      : node.locked 
                        ? "bg-gray-100 text-gray-400" 
                        : "bg-blue-100 text-blue-600"
                    }`}
                >
                  {node.completed ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : node.locked ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </div>
                <span className={`text-xs text-center
                  ${node.locked ? "text-gray-400" : "text-gray-800"}`}
                >
                  {node.title}
                </span>
              </div>
              
              {index < paths.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-300 mx-1" />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressPath;

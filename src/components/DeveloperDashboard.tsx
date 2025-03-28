
import React from "react";
import AdvancedGamification from "@/components/AdvancedGamification";
import ProgressPath from "@/components/ProgressPath";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTotalPoints, calculateLevel } from "@/lib/achievements-data";
import { Trophy, BookOpen, Code, Layers, Star } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const DeveloperDashboard: React.FC = () => {
  const totalPoints = getTotalPoints();
  const currentLevel = calculateLevel(totalPoints);
  
  return (
    <div className="w-full">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Developer Level"
          value={currentLevel}
          description="Your current skill level"
          icon={<Trophy className="h-4 w-4 text-yellow-500" />}
        />
        <StatCard
          title="Total XP"
          value={totalPoints}
          description="Experience points earned"
          icon={<Star className="h-4 w-4 text-purple-500" />}
        />
        <StatCard
          title="Code Components"
          value="12"
          description="Components you've created"
          icon={<Code className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Learning Progress"
          value="40%"
          description="Course completion rate"
          icon={<BookOpen className="h-4 w-4 text-green-500" />}
        />
      </div>
      
      <ProgressPath />
      
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="current-projects">Current Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="achievements">
          <AdvancedGamification />
        </TabsContent>
        <TabsContent value="current-projects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="mr-2 h-5 w-5 text-blue-500" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-1">GitHub Repository Explorer</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Browse and edit code from GitHub repositories
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                    Active
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-1">LLM Integration</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Connect and use AI models for code generation
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                    In Progress (75%)
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-1">RAG System</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Build a retrieval augmented generation system
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                    New (10%)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperDashboard;

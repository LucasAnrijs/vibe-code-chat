
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DeveloperDashboard from "@/components/DeveloperDashboard";
import Gamification from "@/components/Gamification";

const LearningProgress: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Learning Progress</h1>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        <DeveloperDashboard />
        
        <Card>
          <CardHeader>
            <CardTitle>Legacy Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <Gamification />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearningProgress;

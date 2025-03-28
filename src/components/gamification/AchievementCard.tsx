
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Achievement } from "@/lib/achievement-types";
import { categoryColors } from "@/lib/achievement-types";

interface AchievementCardProps {
  achievement: Achievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const Icon = achievement.icon;
  
  return (
    <Card className={`mb-3 ${achievement.earned ? "border-green-300" : "border-gray-200"}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 
              ${achievement.earned ? "bg-green-100" : "bg-gray-100"}`}>
              <Icon className={`h-5 w-5 ${achievement.earned ? "text-green-600" : "text-gray-400"}`} />
            </div>
            <div>
              <CardTitle className="text-sm">
                {achievement.title}
              </CardTitle>
              <Badge 
                variant="outline" 
                className={`text-xs mt-1 ${categoryColors[achievement.category]}`}
              >
                {achievement.category.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <Badge 
            variant={achievement.earned ? "success" : "locked"}
            className="ml-auto"
          >
            {achievement.points} XP
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardDescription>{achievement.description}</CardDescription>
        {achievement.progress && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{achievement.progress.current}/{achievement.progress.total}</span>
            </div>
            <Progress 
              value={(achievement.progress.current / achievement.progress.total) * 100} 
              className="h-2"
            />
          </div>
        )}
        {achievement.earned && achievement.earnedDate && (
          <div className="text-xs text-gray-500 mt-2">
            Earned on {achievement.earnedDate.toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementCard;

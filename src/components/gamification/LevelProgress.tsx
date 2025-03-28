
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Award } from "lucide-react";

interface LevelProgressProps {
  currentLevel: number;
  totalPoints: number;
  nextLevelPoints: number;
  earnedCount: number;
  totalCount: number;
}

const LevelProgress: React.FC<LevelProgressProps> = ({
  currentLevel,
  totalPoints,
  nextLevelPoints,
  earnedCount,
  totalCount
}) => {
  const earnedPercentage = (earnedCount / totalCount) * 100;
  
  return (
    <>
      <div className="flex items-center mb-2">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg mr-3">
          {currentLevel}
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-sm font-medium">
            <span>Level {currentLevel}</span>
            <span>{totalPoints} XP</span>
          </div>
          <Progress 
            value={100 - (nextLevelPoints / (totalPoints + nextLevelPoints)) * 100} 
            className="h-2 mb-1"
          />
          <p className="text-xs text-gray-500">
            {nextLevelPoints} XP to level {currentLevel + 1}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold">{earnedCount}</div>
          <div className="text-xs text-gray-500">Achievements earned</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold">{Math.round(earnedPercentage)}%</div>
          <div className="text-xs text-gray-500">Completion rate</div>
        </div>
      </div>
    </>
  );
};

export default LevelProgress;


import React from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Achievement } from "@/lib/achievement-types";

interface RecentAchievementsProps {
  achievements: Achievement[];
}

const RecentAchievements: React.FC<RecentAchievementsProps> = ({ achievements }) => {
  if (achievements.length === 0) return null;
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Recent Achievements</h3>
      <div className="space-y-2">
        {achievements.map(achievement => (
          <div key={achievement.id} className="flex items-center p-2 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-100 mr-2">
              <Star className="h-3 w-3 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium">{achievement.title}</div>
              <div className="text-xs text-gray-500">
                {achievement.earnedDate?.toLocaleDateString()}
              </div>
            </div>
            <Badge variant="outline" className="ml-auto">
              +{achievement.points} XP
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAchievements;

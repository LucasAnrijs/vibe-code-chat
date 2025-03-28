
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  achievements, 
  getTotalPoints, 
  calculateLevel, 
  pointsToNextLevel, 
  getRecentAchievements 
} from "@/lib/achievements-data";
import type { AchievementCategory } from "@/lib/achievement-types";
import { Award } from "lucide-react";
import LevelProgress from "./gamification/LevelProgress";
import RecentAchievements from "./gamification/RecentAchievements";
import AchievementList from "./gamification/AchievementList";

const AdvancedGamification: React.FC = () => {
  const totalPoints = getTotalPoints();
  const currentLevel = calculateLevel(totalPoints);
  const nextLevelPoints = pointsToNextLevel(totalPoints);
  const recentAchievements = getRecentAchievements();
  
  const categoryCounts = {} as Record<AchievementCategory, { total: number, earned: number }>;
  achievements.forEach(a => {
    if (!categoryCounts[a.category]) {
      categoryCounts[a.category] = { total: 0, earned: 0 };
    }
    categoryCounts[a.category].total++;
    if (a.earned) categoryCounts[a.category].earned++;
  });
  
  const earnedCount = achievements.filter(a => a.earned).length;
  
  return (
    <div className="advanced-gamification">
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5 text-yellow-500" />
            Developer Progress
          </CardTitle>
          <CardDescription>Track your achievements and level up</CardDescription>
        </CardHeader>
        <CardContent>
          <LevelProgress 
            currentLevel={currentLevel}
            totalPoints={totalPoints}
            nextLevelPoints={nextLevelPoints}
            earnedCount={earnedCount}
            totalCount={achievements.length}
          />
          
          <RecentAchievements achievements={recentAchievements} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Achievements</CardTitle>
          <CardDescription>
            Collect achievements by using the application features
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <AchievementList 
            achievements={achievements}
            categoryCounts={categoryCounts}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedGamification;

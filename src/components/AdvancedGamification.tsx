import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  achievements, 
  getTotalPoints, 
  calculateLevel, 
  pointsToNextLevel, 
  getRecentAchievements 
} from "@/lib/achievements-data";
import type { AchievementCategory, Achievement } from "@/lib/achievement-types";
import { categoryColors, categoryIcons } from "@/lib/achievement-types";
import { Award, Star } from "lucide-react";

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

const AchievementCategory: React.FC<{
  category: AchievementCategory;
  count: number;
  earnedCount: number;
}> = ({ category, count, earnedCount }) => {
  const Icon = categoryIcons[category];
  return (
    <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${categoryColors[category]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium capitalize">{category.replace('_', ' ')}</h3>
        <div className="text-xs text-gray-500">{earnedCount}/{count} completed</div>
      </div>
      <div className="w-12 text-right">
        <span className="text-xs font-medium">{Math.round((earnedCount / count) * 100)}%</span>
      </div>
    </div>
  );
};

const AdvancedGamification: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  const totalPoints = getTotalPoints();
  const currentLevel = calculateLevel(totalPoints);
  const nextLevelPoints = pointsToNextLevel(totalPoints);
  const recentAchievements = getRecentAchievements();
  
  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === "all") return true;
    if (activeTab === "earned") return achievement.earned;
    if (activeTab === "in-progress") return !achievement.earned && achievement.progress;
    if (activeTab === "locked") return !achievement.earned;
    return achievement.category === activeTab;
  });
  
  const categoryCounts = {} as Record<AchievementCategory, { total: number, earned: number }>;
  achievements.forEach(a => {
    if (!categoryCounts[a.category]) {
      categoryCounts[a.category] = { total: 0, earned: 0 };
    }
    categoryCounts[a.category].total++;
    if (a.earned) categoryCounts[a.category].earned++;
  });
  
  const earnedPercentage = (achievements.filter(a => a.earned).length / achievements.length) * 100;
  
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
              <div className="text-2xl font-bold">{achievements.filter(a => a.earned).length}</div>
              <div className="text-xs text-gray-500">Achievements earned</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold">{Math.round(earnedPercentage)}%</div>
              <div className="text-xs text-gray-500">Completion rate</div>
            </div>
          </div>
          
          {recentAchievements.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Recent Achievements</h3>
              <div className="space-y-2">
                {recentAchievements.map(achievement => (
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
          )}
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
          <div className="px-4">
            <div className="mb-4 max-h-60 overflow-y-auto">
              {Object.entries(categoryCounts).map(([category, counts]) => (
                <AchievementCategory 
                  key={category}
                  category={category as AchievementCategory}
                  count={counts.total}
                  earnedCount={counts.earned}
                />
              ))}
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4">
              <TabsList className="w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="earned">Earned</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="locked">Locked</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={activeTab} className="m-0">
              <div className="p-4 max-h-96 overflow-y-auto">
                {filteredAchievements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No achievements in this category yet
                  </div>
                ) : (
                  filteredAchievements.map(achievement => (
                    <AchievementCard 
                      key={achievement.id} 
                      achievement={achievement}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="pt-2">
          <Button variant="outline" className="w-full">View All Achievements</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdvancedGamification;

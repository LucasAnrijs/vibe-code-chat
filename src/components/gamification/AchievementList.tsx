
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import AchievementCard from "./AchievementCard";
import type { Achievement, AchievementCategory } from "@/lib/achievement-types";
import AchievementCategoryItem from "./AchievementCategory";

interface AchievementListProps {
  achievements: Achievement[];
  categoryCounts: Record<AchievementCategory, { total: number; earned: number }>;
}

const AchievementList: React.FC<AchievementListProps> = ({ 
  achievements,
  categoryCounts
}) => {
  const [activeTab, setActiveTab] = React.useState("all");
  
  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === "all") return true;
    if (activeTab === "earned") return achievement.earned;
    if (activeTab === "in-progress") return !achievement.earned && achievement.progress;
    if (activeTab === "locked") return !achievement.earned;
    return achievement.category === activeTab;
  });
  
  return (
    <>
      <div className="px-4">
        <div className="mb-4 max-h-60 overflow-y-auto">
          {Object.entries(categoryCounts).map(([category, counts]) => (
            <AchievementCategoryItem 
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
      <CardFooter className="pt-2">
        <Button variant="outline" className="w-full">View All Achievements</Button>
      </CardFooter>
    </>
  );
};

export default AchievementList;

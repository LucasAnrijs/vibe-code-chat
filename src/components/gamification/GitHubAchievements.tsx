
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Achievement } from "@/lib/achievement-types";
import { GithubRepo } from "@/services/githubService";
import { getTotalPoints, achievements } from "@/lib/achievements-data";
import { Award, Trophy, Github } from "lucide-react";
import AchievementCategoryItem from "./AchievementCategory";
import { toast } from "@/hooks/use-toast";

interface GitHubAchievementsProps {
  repo?: GithubRepo | null;
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

const GitHubAchievements: React.FC<GitHubAchievementsProps> = ({ 
  repo,
  onAchievementUnlocked 
}) => {
  // Filter only GitHub-related achievements
  const githubAchievements = achievements.filter(a => a.category === "github");
  const earnedCount = githubAchievements.filter(a => a.earned).length;
  
  // Simulate unlocking the "Repository Opener" achievement when a repo is loaded
  React.useEffect(() => {
    if (repo) {
      const repoOpenAchievement = achievements.find(a => a.id === "github-repo");
      if (repoOpenAchievement && !repoOpenAchievement.earned) {
        // This would typically be handled by a global achievement service
        // For demo purposes, we're just showing a toast
        toast({
          title: "Achievement Unlocked! 🏆",
          description: "Repository Opener: Open your first GitHub repository",
        });
        
        if (onAchievementUnlocked) {
          onAchievementUnlocked(repoOpenAchievement);
        }
      }
    }
  }, [repo, onAchievementUnlocked]);

  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
          GitHub Achievements
        </CardTitle>
        <CardDescription>
          Track your GitHub usage achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm font-medium mb-1">
            <span>Progress</span>
            <span>{earnedCount}/{githubAchievements.length} achievements</span>
          </div>
          <Progress 
            value={(earnedCount / githubAchievements.length) * 100} 
            className="h-2"
          />
        </div>
        
        <div className="space-y-2">
          {githubAchievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`p-2 rounded-lg border ${achievement.earned ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 
                  ${achievement.earned ? "bg-green-100" : "bg-gray-100"}`}>
                  <Github className={`h-5 w-5 ${achievement.earned ? "text-green-600" : "text-gray-400"}`} />
                </div>
                <div>
                  <h3 className="text-sm font-medium">{achievement.title}</h3>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                  
                  {achievement.progress && (
                    <div className="mt-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">{achievement.progress.current}/{achievement.progress.total}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress.current / achievement.progress.total) * 100} 
                        className="h-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GitHubAchievements;

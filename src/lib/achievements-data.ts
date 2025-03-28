
import { Achievement, AchievementCategory } from "@/lib/achievement-types";
import { Award, Star, BookCheck, Gift, Trophy, BadgeCheck, BadgePercent } from "lucide-react";

// Helper function to create an achievement
const createAchievement = (
  id: string,
  title: string,
  description: string,
  category: AchievementCategory,
  points: number,
  icon: any, // Using any here for simplicity
  earned: boolean,
  progress?: { current: number; total: number },
  earnedDate?: Date,
  secret: boolean = false
): Achievement => ({
  id,
  title,
  description,
  category,
  points,
  icon,
  earned,
  progress,
  earnedDate,
  secret
});

// Sample achievements data
export const achievements: Achievement[] = [
  // Coding achievements
  createAchievement(
    "code-first-component",
    "Component Creator",
    "Create your first React component",
    "coding",
    10,
    BookCheck,
    true,
    undefined,
    new Date("2023-12-15")
  ),
  createAchievement(
    "code-refactor",
    "Code Refactorer",
    "Successfully refactor a component",
    "coding",
    25,
    BookCheck,
    false,
    { current: 2, total: 5 }
  ),
  createAchievement(
    "code-typescript",
    "TypeScript Master",
    "Write a fully typed component with interfaces",
    "coding",
    50,
    BookCheck,
    false
  ),
  
  // AI usage achievements
  createAchievement(
    "ai-first-prompt",
    "AI Explorer",
    "Use the AI assistant for the first time",
    "ai_usage",
    5,
    Star,
    true,
    undefined,
    new Date("2024-01-10")
  ),
  createAchievement(
    "ai-integration",
    "AI Integrator",
    "Build a feature that uses the LLM API",
    "ai_usage",
    100,
    Star,
    true,
    undefined,
    new Date("2024-01-23")
  ),
  createAchievement(
    "ai-rag",
    "RAG Master",
    "Successfully build and use a RAG system",
    "ai_usage",
    150,
    Star,
    false,
    { current: 0, total: 1 }
  ),
  
  // GitHub achievements
  createAchievement(
    "github-repo",
    "Repository Opener",
    "Open your first GitHub repository",
    "github",
    10,
    Trophy,
    true,
    undefined,
    new Date("2024-02-05")
  ),
  createAchievement(
    "github-browse",
    "Code Explorer",
    "Browse through 50 files in repositories",
    "github",
    25,
    Trophy,
    false,
    { current: 23, total: 50 }
  ),
  createAchievement(
    "github-index",
    "Index Builder",
    "Index 5 different repositories for RAG",
    "github",
    75,
    Trophy,
    false,
    { current: 1, total: 5 }
  ),
  
  // Learning achievements
  createAchievement(
    "learn-basics",
    "Foundation Builder",
    "Complete the React basics learning path",
    "learning",
    20,
    BadgeCheck,
    true,
    undefined,
    new Date("2023-11-20")
  ),
  createAchievement(
    "learn-advanced",
    "Advanced Scholar",
    "Complete the advanced React patterns learning path",
    "learning",
    100,
    BadgeCheck,
    false,
    { current: 3, total: 10 }
  ),
  
  // Collaboration achievements
  createAchievement(
    "collab-share",
    "Code Sharer",
    "Share your work with another user",
    "collaboration",
    15,
    BadgePercent,
    false
  ),
  createAchievement(
    "collab-forum",
    "Forum Contributor",
    "Help 10 other users with their coding questions",
    "collaboration",
    50,
    BadgePercent,
    false,
    { current: 2, total: 10 }
  ),
  
  // Secret achievements
  createAchievement(
    "secret-easter-egg",
    "Easter Egg Hunter",
    "Find a hidden feature in the application",
    "coding",
    100,
    Gift,
    false,
    undefined,
    undefined,
    true
  )
];

// Get total achievements by category
export const getAchievementsByCategory = () => {
  const categories: Record<AchievementCategory, number> = {
    coding: 0,
    ai_usage: 0,
    github: 0,
    learning: 0,
    collaboration: 0
  };
  
  achievements.forEach(achievement => {
    categories[achievement.category]++;
  });
  
  return categories;
};

// Calculate user level based on points
export const calculateLevel = (points: number): number => {
  return Math.floor(Math.sqrt(points / 10)) + 1;
};

// Calculate points to next level
export const pointsToNextLevel = (currentPoints: number): number => {
  const currentLevel = calculateLevel(currentPoints);
  const nextLevelPoints = Math.pow(currentLevel, 2) * 10;
  return nextLevelPoints - currentPoints;
};

// Get total points from all earned achievements
export const getTotalPoints = (): number => {
  return achievements
    .filter(a => a.earned)
    .reduce((sum, achievement) => sum + achievement.points, 0);
};

// Get recently earned achievements
export const getRecentAchievements = (count: number = 3): Achievement[] => {
  return achievements
    .filter(a => a.earned && a.earnedDate)
    .sort((a, b) => {
      if (!a.earnedDate || !b.earnedDate) return 0;
      return b.earnedDate.getTime() - a.earnedDate.getTime();
    })
    .slice(0, count);
};

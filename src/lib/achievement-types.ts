
import { Award, Star, BookCheck, Gift, Trophy, BadgeCheck, BadgePercent } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  points: number;
  icon: LucideIcon;
  earned: boolean;
  progress?: {
    current: number;
    total: number;
  };
  earnedDate?: Date;
  secret?: boolean;
}

export type AchievementCategory = 
  | "coding" 
  | "ai_usage" 
  | "github" 
  | "learning" 
  | "collaboration";

export const categoryColors: Record<AchievementCategory, string> = {
  coding: "bg-blue-100 text-blue-800",
  ai_usage: "bg-purple-100 text-purple-800",
  github: "bg-gray-100 text-gray-800",
  learning: "bg-green-100 text-green-800",
  collaboration: "bg-yellow-100 text-yellow-800"
};

export const categoryIcons: Record<AchievementCategory, LucideIcon> = {
  coding: BookCheck,
  ai_usage: Star,
  github: Trophy, 
  learning: BadgeCheck,
  collaboration: BadgePercent
};

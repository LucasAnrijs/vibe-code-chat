
import React from "react";
import type { AchievementCategory } from "@/lib/achievement-types";
import { categoryColors, categoryIcons } from "@/lib/achievement-types";

interface AchievementCategoryProps {
  category: AchievementCategory;
  count: number;
  earnedCount: number;
}

const AchievementCategoryItem: React.FC<AchievementCategoryProps> = ({ 
  category, 
  count, 
  earnedCount 
}) => {
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

export default AchievementCategoryItem;

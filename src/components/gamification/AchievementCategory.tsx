
import React from "react";
import type { AchievementCategory } from "@/lib/achievement-types";
import { categoryColors, categoryIcons } from "@/lib/achievement-types";
import { Badge } from "@/components/ui/badge";

interface AchievementCategoryProps {
  category: AchievementCategory;
  count: number;
  earnedCount: number;
  onClick?: (category: AchievementCategory) => void;
}

const AchievementCategoryItem: React.FC<AchievementCategoryProps> = ({ 
  category, 
  count, 
  earnedCount,
  onClick
}) => {
  const Icon = categoryIcons[category];
  const percentage = Math.round((earnedCount / count) * 100);
  
  return (
    <div 
      className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-150 hover:shadow-sm"
      onClick={() => onClick?.(category)}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${categoryColors[category]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium capitalize">{category.replace('_', ' ')}</h3>
        <div className="text-xs text-gray-500">{earnedCount}/{count} completed</div>
      </div>
      <div className="w-12 text-right">
        {earnedCount > 0 ? (
          <Badge variant={percentage === 100 ? "success" : "outline"} className="text-xs">
            {percentage}%
          </Badge>
        ) : (
          <span className="text-xs font-medium text-gray-400">{percentage}%</span>
        )}
      </div>
    </div>
  );
};

export default AchievementCategoryItem;

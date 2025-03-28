
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface Achievement {
  id: number;
  title: string;
  description: string;
  earned: boolean;
}

const achievements: Achievement[] = [
  { id: 1, title: 'First Steps', description: 'Complete your first lesson.', earned: true },
  { id: 2, title: 'Code Master', description: 'Submit 10 code snippets.', earned: false },
  { id: 3, title: 'Peer Helper', description: 'Help another user with their question.', earned: false },
  { id: 4, title: 'Feedback Provider', description: 'Submit feedback on a lesson.', earned: false },
];

const Gamification: React.FC = () => {
  return (
    <div className="gamification-container">
      <h2 className="text-lg font-bold mb-4">Achievements</h2>
      <div className="achievements-list space-y-3">
        {achievements.map(achievement => (
          <div key={achievement.id} className="achievement-item flex items-center gap-2 p-2 rounded-md border">
            <Badge variant={achievement.earned ? 'default' : 'outline'} className={achievement.earned ? 'bg-green-500' : ''}>
              {achievement.title}
            </Badge>
            <p className="text-sm text-gray-600">{achievement.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gamification;

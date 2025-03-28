
import { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Code, 
  CodepenIcon, 
  Database, 
  Server, 
  Layout,
  Star
} from "lucide-react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted?: boolean;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  totalDuration: string;
  progress?: number;
  lessons: Lesson[];
}

const ChaptersList = () => {
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({
    "chapter-1": true
  });

  const toggleChapter = (chapterId: string) => {
    setOpenChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const chapters: Chapter[] = [
    {
      id: "chapter-1",
      title: "JavaScript Fundamentals",
      description: "Master the core concepts of JavaScript programming",
      icon: CodepenIcon,
      totalDuration: "5 hours",
      progress: 25,
      lessons: [
        { id: "js-1", title: "Variables and Data Types", duration: "30 min", isCompleted: true },
        { id: "js-2", title: "Functions and Scope", duration: "45 min" },
        { id: "js-3", title: "Arrays and Objects", duration: "1 hour" },
        { id: "js-4", title: "Control Flow and Loops", duration: "45 min" },
        { id: "js-5", title: "Error Handling", duration: "30 min" },
        { id: "js-6", title: "Modern JavaScript Features", duration: "1 hour 30 min" }
      ]
    },
    {
      id: "chapter-2",
      title: "React Essentials",
      description: "Build interactive UIs with React",
      icon: Code,
      totalDuration: "8 hours",
      progress: 0,
      lessons: [
        { id: "react-1", title: "React Components", duration: "1 hour" },
        { id: "react-2", title: "Props and State", duration: "1 hour 15 min" },
        { id: "react-3", title: "Hooks Fundamentals", duration: "1 hour 30 min" },
        { id: "react-4", title: "Forms and Events", duration: "1 hour" },
        { id: "react-5", title: "Styling in React", duration: "45 min" },
        { id: "react-6", title: "Context API", duration: "1 hour" },
        { id: "react-7", title: "Advanced Hooks", duration: "1 hour 30 min" }
      ]
    },
    {
      id: "chapter-3",
      title: "Tailwind CSS Styling",
      description: "Create beautiful, responsive UIs with utility-first CSS",
      icon: Layout,
      totalDuration: "4 hours",
      lessons: [
        { id: "tw-1", title: "Tailwind Fundamentals", duration: "45 min" },
        { id: "tw-2", title: "Layout and Responsive Design", duration: "1 hour" },
        { id: "tw-3", title: "Customizing Tailwind", duration: "45 min" },
        { id: "tw-4", title: "Advanced Styling Techniques", duration: "1 hour 30 min" }
      ]
    },
    {
      id: "chapter-4",
      title: "Backend Integration",
      description: "Connect your frontend to APIs and databases",
      icon: Database,
      totalDuration: "6 hours",
      lessons: [
        { id: "api-1", title: "RESTful API Basics", duration: "1 hour" },
        { id: "api-2", title: "Fetching Data with React", duration: "1 hour 15 min" },
        { id: "api-3", title: "State Management with APIs", duration: "1 hour 30 min" },
        { id: "api-4", title: "Authentication Flows", duration: "1 hour 15 min" },
        { id: "api-5", title: "Real-time Data with WebSockets", duration: "1 hour" }
      ]
    },
    {
      id: "chapter-5",
      title: "Fullstack Project",
      description: "Build a complete web application from scratch",
      icon: Server,
      totalDuration: "10 hours",
      lessons: [
        { id: "proj-1", title: "Project Setup and Planning", duration: "1 hour" },
        { id: "proj-2", title: "Frontend Structure", duration: "2 hours" },
        { id: "proj-3", title: "Backend Development", duration: "3 hours" },
        { id: "proj-4", title: "Database Design and Implementation", duration: "2 hours" },
        { id: "proj-5", title: "Testing and Deployment", duration: "2 hours" }
      ]
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-vibe-dark mb-4">Your Learning Path</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Progress through these chapters to become a proficient fullstack developer
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {chapters.map((chapter) => (
            <Card key={chapter.id} className="overflow-hidden border-l-4 border-l-vibe-purple hover:shadow-md transition-shadow">
              <Collapsible open={openChapters[chapter.id]} onOpenChange={() => toggleChapter(chapter.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-vibe-purple/10 p-2 rounded-lg">
                          <chapter.icon className="h-6 w-6 text-vibe-purple" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{chapter.title}</CardTitle>
                          <CardDescription className="text-sm mt-1">{chapter.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500 hidden md:block">
                          {chapter.totalDuration}
                        </div>
                        {chapter.progress !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-200 h-2 w-24 rounded-full">
                              <div 
                                className="bg-vibe-purple h-2 rounded-full" 
                                style={{ width: `${chapter.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{chapter.progress}%</span>
                          </div>
                        )}
                        <div>
                          {openChapters[chapter.id] ? 
                            <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          }
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {chapter.lessons.map((lesson) => (
                        <div key={lesson.id} className="p-3 rounded-lg hover:bg-gray-50 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${lesson.isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              {lesson.isCompleted ? (
                                <Star className="h-3 w-3" />
                              ) : (
                                <BookOpen className="h-3 w-3" />
                              )}
                            </div>
                            <span className={`font-medium ${lesson.isCompleted ? 'text-gray-400' : 'text-gray-700'}`}>
                              {lesson.title}
                              {lesson.isCompleted && (
                                <Badge className="ml-2 bg-green-100 text-green-600 hover:bg-green-200 text-xs">Completed</Badge>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">{lesson.duration}</span>
                            <Button variant="ghost" size="sm" className="text-vibe-purple hover:text-vibe-purple/90 hover:bg-vibe-purple/10">
                              Start
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button className="bg-vibe-purple hover:bg-vibe-purple/90 text-white">
                        Start Chapter
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChaptersList;

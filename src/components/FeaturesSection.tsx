
import { MessageCircle, Code, Lightbulb, Book, Users, Play } from "lucide-react";

const features = [
  {
    icon: <MessageCircle className="h-6 w-6 text-vibe-purple" />,
    title: "Chat-Based Learning",
    description: "Learn coding concepts through natural conversations, just like chatting with a friend who's an expert developer."
  },
  {
    icon: <Code className="h-6 w-6 text-vibe-purple" />,
    title: "Interactive Code Examples",
    description: "See, edit and run real code examples right in the chat interface."
  },
  {
    icon: <Lightbulb className="h-6 w-6 text-vibe-purple" />,
    title: "Personalized Learning Path",
    description: "Our AI adapts to your skill level and learning style for maximum effectiveness."
  },
  {
    icon: <Book className="h-6 w-6 text-vibe-purple" />,
    title: "Comprehensive Curriculum",
    description: "From basics to advanced topics across multiple programming languages and frameworks."
  },
  {
    icon: <Users className="h-6 w-6 text-vibe-purple" />,
    title: "Community Challenges",
    description: "Solve coding challenges with other learners and build your portfolio."
  },
  {
    icon: <Play className="h-6 w-6 text-vibe-purple" />,
    title: "Project-Based Learning",
    description: "Apply your skills by building real projects guided by our interactive system."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vibe-dark mb-4">
            Features that set the right <span className="text-vibe-purple">coding vibe</span>
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to learn coding effectively, all in one conversational interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`
                bg-white p-6 rounded-xl border border-gray-200 shadow-sm 
                hover:shadow-md transition-shadow
                ${index === 0 ? 'ring-2 ring-vibe-purple scale-105 shadow-md transform hover:scale-110 transition-all duration-300' : ''}
              `}
            >
              <div className={`${index === 0 ? 'bg-vibe-purple p-3 rounded-lg inline-block mb-4' : 'bg-purple-50 p-3 rounded-lg inline-block mb-4'}`}>
                {index === 0 ? 
                  <MessageCircle className="h-6 w-6 text-white" /> :
                  feature.icon
                }
              </div>
              <h3 className={`text-xl font-semibold ${index === 0 ? 'text-vibe-purple' : 'text-vibe-dark'} mb-3`}>
                {feature.title}
                {index === 0 && <span className="ml-2 text-xs bg-purple-100 text-vibe-purple px-2 py-1 rounded-full">Live Demo</span>}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

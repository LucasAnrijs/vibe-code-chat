
import { MessageCircle, Code, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: <MessageCircle className="h-8 w-8 text-white" />,
    title: "Start a Conversation",
    description: "Begin by chatting about what you want to learn. Our AI will guide the conversation based on your goals and current knowledge."
  },
  {
    icon: <Code className="h-8 w-8 text-white" />,
    title: "Learn Through Dialogue",
    description: "Ask questions, get explanations, and see examples. The system adapts to your pace and provides personalized guidance."
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-white" />,
    title: "Practice and Apply",
    description: "Try coding challenges right in the chat. Get immediate feedback and help if you get stuck."
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vibe-dark mb-4">
            How VibeCode <span className="text-vibe-purple">Works</span>
          </h2>
          <p className="text-xl text-gray-600">
            Learning to code has never been more natural or intuitive
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 relative">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full">
                <div className="bg-vibe-purple rounded-full w-14 h-14 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-vibe-dark mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-8 w-8 text-vibe-purple" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="bg-gradient-to-r from-vibe-purple to-vibe-teal rounded-xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to start your coding journey?</h3>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of learners who are mastering coding concepts through conversations.
          </p>
          <button className="bg-white text-vibe-purple hover:bg-gray-100 transition-colors font-semibold py-3 px-8 rounded-full">
            Try It Free
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

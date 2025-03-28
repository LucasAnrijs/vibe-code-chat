
import { Button } from "@/components/ui/button";
import { MessageCircle, GraduationCap, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-vibe-dark">
              Learn to code with the <span className="text-vibe-purple">perfect vibe</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Master coding through friendly chat interactions. It&apos;s like texting with a patient mentor who&apos;s always ready to help you grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button size="lg" className="bg-vibe-purple hover:bg-vibe-purple/90 text-white px-8">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="border-vibe-purple text-vibe-purple hover:bg-vibe-purple hover:text-white">
                See Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-500 pt-4">No credit card required</div>
          </div>

          <div className="flex-1 relative">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-md mx-auto">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="ml-2 text-sm text-gray-500">chat.vibecode.io</div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-vibe-purple text-white p-2 rounded-full">
                    <GraduationCap size={20} />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 text-sm max-w-[80%]">
                    Let&apos;s learn how to create a function in JavaScript. What&apos;s your coding experience?
                  </div>
                </div>
                
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-gray-100 rounded-lg p-3 text-sm max-w-[80%]">
                    I&apos;m a beginner. I&apos;ve done some HTML and CSS but JavaScript feels intimidating.
                  </div>
                  <div className="bg-gray-200 text-gray-800 p-2 rounded-full">
                    <MessageCircle size={20} />
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-vibe-purple text-white p-2 rounded-full">
                    <GraduationCap size={20} />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 text-sm max-w-[80%]">
                    No worries! Let&apos;s start with the basics. Here&apos;s a simple function:
                    <pre className="bg-gray-800 text-green-400 p-2 rounded mt-2 overflow-x-auto">
                      function sayHello() {'{'}
                        console.log("Hello, world!");
                      {'}'}
                    </pre>
                    Try running this. What questions do you have?
                  </div>
                </div>
                
                <div className="relative">
                  <div className="h-10 bg-gray-100 rounded-full flex items-center pl-4 pr-12">
                    <div className="animate-typing overflow-hidden whitespace-nowrap border-r-2 border-gray-500 pr-1">
                      How do I call this function?
                    </div>
                  </div>
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-vibe-purple">
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

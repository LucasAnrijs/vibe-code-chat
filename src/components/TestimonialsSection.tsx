
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    quote: "VibeCode changed how I approach learning to code. The conversational format makes complex concepts so much more approachable.",
    name: "Alex Johnson",
    role: "Web Developer",
    avatar: "AJ"
  },
  {
    quote: "After trying countless coding platforms, VibeCode was the one that finally helped me break through. It's like having a patient tutor available 24/7.",
    name: "Samantha Park",
    role: "UX Designer",
    avatar: "SP"
  },
  {
    quote: "As someone with ADHD, traditional coding tutorials never worked for me. The chat-based approach keeps me engaged and actually excited to learn.",
    name: "Marcus Chen",
    role: "CS Student",
    avatar: "MC"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vibe-dark mb-4">
            What Our <span className="text-vibe-purple">Users Say</span>
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of learners who've transformed their coding journey with VibeCode
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 text-4xl text-vibe-purple opacity-30">"</div>
                    <p className="text-gray-700 relative z-10 pt-4">
                      {testimonial.quote}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 pt-4">
                    <Avatar>
                      <AvatarFallback className="bg-purple-100 text-vibe-purple">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-vibe-dark">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

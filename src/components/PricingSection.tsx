
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free Trial",
    price: "$0",
    description: "Perfect for beginners to try out VibeCode",
    features: [
      "7-day access to all features",
      "Basic coding concepts",
      "HTML & CSS fundamentals",
      "Limited JavaScript tutorials",
      "Community forum access"
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "outline" as const
  },
  {
    name: "Standard",
    price: "$19",
    period: "/month",
    description: "For committed learners ready to develop real skills",
    popular: true,
    features: [
      "Unlimited chat-based learning",
      "Complete language tutorials",
      "Interactive code challenges",
      "Project-based learning",
      "Progress tracking",
      "Priority support"
    ],
    buttonText: "Get Started",
    buttonVariant: "default" as const
  },
  {
    name: "Pro",
    price: "$39",
    period: "/month",
    description: "For serious coders looking to master advanced topics",
    features: [
      "Everything in Standard",
      "Advanced topics & frameworks",
      "Real-world project simulations",
      "Code reviews & feedback",
      "1-on-1 weekly mentor sessions",
      "Career path guidance"
    ],
    buttonText: "Go Pro",
    buttonVariant: "outline" as const
  }
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vibe-dark mb-4">
            Simple, Transparent <span className="text-vibe-purple">Pricing</span>
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your learning goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`border ${plan.popular ? 'border-vibe-purple shadow-lg relative' : 'border-gray-200'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-vibe-purple text-white text-sm font-semibold py-1 px-3 rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold text-vibe-dark">{plan.price}</span>
                  {plan.period && <span className="text-gray-500 ml-1">{plan.period}</span>}
                </div>
                <CardDescription className="text-gray-600 mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-vibe-purple shrink-0 mr-2 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={plan.buttonVariant} 
                  className={`w-full ${plan.buttonVariant === 'outline' ? 'border-vibe-purple text-vibe-purple hover:bg-vibe-purple hover:text-white' : 'bg-vibe-purple hover:bg-vibe-purple/90 text-white'}`}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12 text-gray-600">
          <p>All plans include a 14-day money-back guarantee</p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

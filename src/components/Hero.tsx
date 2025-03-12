
import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full filter blur-3xl opacity-50" />
      </div>

      <div 
        className={cn(
          "max-w-4xl w-full text-center transition-all duration-1000 transform",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        <div className="inline-block">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-6">
            Mathematical Programming Simplified
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-medium tracking-tight mb-6">
          Elegant Solutions for Complex 
          <span className="text-primary"> Mathematical Problems</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          A powerful, intuitive platform for solving linear programming problems with precision and visual clarity.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/dashboard">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8">
            <Link to="/about">
              Learn More
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Down indicator */}
      <div 
        className={cn(
          "absolute bottom-10 left-1/2 transform -translate-x-1/2 transition-opacity duration-1000",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="animate-bounce w-10 h-10 flex items-center justify-center text-muted-foreground cursor-pointer">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 15L3 8H17L10 15Z" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Hero;

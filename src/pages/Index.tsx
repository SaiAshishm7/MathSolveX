import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, BarChart3, Truck, Users, ArrowRight, Clock, Factory } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeatureCard from '@/components/FeatureCard';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      title: 'Graphical Method',
      description: 'Visualize and solve two-variable linear programming problems with interactive graphics.',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/graphical-method'
    },
    {
      title: 'Simplex Method',
      description: 'Solve complex linear optimization problems using the powerful simplex algorithm.',
      icon: <Calculator className="w-6 h-6" />,
      path: '/simplex-method'
    },
    {
      title: 'Transportation Problems',
      description: 'Optimize distribution networks and minimize transportation costs.',
      icon: <Truck className="w-6 h-6" />,
      path: '/transportation'
    },
    {
      title: 'Workforce Shift Scheduler',
      description: 'Smart shift scheduling with fair distribution and worker preference optimization.',
      icon: <Clock className="w-6 h-6" />,
      path: '/workforce-shift-scheduler'
    },
    {
      title: 'AutoFlow Optimizer',
      description: 'AI-Powered JIT Manufacturing & Supply Chain Optimization.',
      icon: <Users className="w-6 h-6" />,
      path: '/workforce-optimization'
    },
    {
      title: 'Production Line Balancing',
      description: 'Optimize worker allocation across production lines to maximize efficiency.',
      icon: <Factory className="w-6 h-6" />,
      path: '/production-lines'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <section className="py-20 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-medium mb-4">
                Powerful Mathematical <span className="text-primary">Tools</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Solve complex optimization problems with elegance and precision
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  onClick={() => navigate(feature.path)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Workforce Optimization Highlight */}
        <section className="py-20 px-6 bg-gradient-to-b from-muted/50 to-background">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-6">
                  Case Study
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-medium mb-6">
                 AI-Powered JIT Manufacturing & Supply Chain Optimization
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Our specialized model helps manufacturing companies dynamically allocate their workforce based on changing constraints and production demands.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>Ensure just-in-time (JIT) delivery with minimal delays ⏳🚛</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>Optimize supplier selection and transportation routes 📦🛤️
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>Balance cost efficiency with production demands 💰⚖️</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>Adapt in real-time to supply chain disruptions 🔄⚡</span>
                  </li>
                </ul>
                <Button asChild>
                  <Link to="/workforce-optimization" className="inline-flex items-center">
                    Explore Case Study
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-border shadow-elegant">
                <div className="aspect-video bg-muted relative">
                  <img 
                    src="jit-manufacturing.jpg" 
                    alt="AI-Powered JIT Manufacturing" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-medium mb-6">
              Ready to Optimize Your Problems?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Get started with our mathematical programming platform and find elegant solutions to your complex problems.
            </p>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/dashboard">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;

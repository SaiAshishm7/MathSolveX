import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, BarChart3, Truck, Users, Clock, Factory } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeatureCard from '@/components/FeatureCard';

const Dashboard = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const solvers = [
    {
      title: 'Graphical Method',
      description: 'Solve two-variable linear programming problems using visual approach. Ideal for simple problems and educational purposes.',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/graphical-method'
    },
    {
      title: 'Simplex Method',
      description: 'Powerful algorithm for solving linear programming problems with multiple variables and constraints.',
      icon: <Calculator className="w-6 h-6" />,
      path: '/simplex-method'
    },
    {
      title: 'Transportation Problems',
      description: 'Optimize distribution networks to minimize transportation costs between sources and destinations.',
      icon: <Truck className="w-6 h-6" />,
      path: '/transportation'
    }
  ];

  const applications = [
    {
      title: 'Workforce Optimization',
      description: 'Optimize workforce allocation across different tasks and projects.',
      icon: <Users className="w-6 h-6" />,
      path: '/workforce-optimization'
    },
    {
      title: 'Workforce Shift Scheduler',
      description: 'Create and manage optimal shift schedules for your workforce.',
      icon: <Clock className="w-6 h-6" />,
      path: '/workforce-shift-scheduler'
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
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-medium mb-4">
              Linear Programming <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Select a solver or explore real-world applications
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-display font-medium mb-6">Solution Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solvers.map((solver, index) => (
                <FeatureCard
                  key={index}
                  title={solver.title}
                  description={solver.description}
                  icon={solver.icon}
                  onClick={() => navigate(solver.path)}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-medium mb-6">Real-World Applications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app, index) => (
                <FeatureCard
                  key={index}
                  title={app.title}
                  description={app.description}
                  icon={app.icon}
                  onClick={() => navigate(app.path)}
                />
              ))}
            </div>
          </section>

          <section className="mt-16">
            <div className="rounded-2xl border border-border p-8 bg-muted/30">
              <h2 className="text-2xl font-display font-medium mb-4">Recent Updates</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <h3 className="font-medium">Production Line Balancing Added</h3>
                    <p className="text-sm text-muted-foreground">New tool for optimizing worker allocation across production lines to maximize efficiency.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <h3 className="font-medium">Workforce Shift Scheduler Added</h3>
                    <p className="text-sm text-muted-foreground">New tool for optimizing worker schedules with fair distribution and preferences.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <h3 className="font-medium">Transportation Problem Solver Added</h3>
                    <p className="text-sm text-muted-foreground">Now you can solve complex transportation and distribution problems.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <h3 className="font-medium">User Interface Improvements</h3>
                    <p className="text-sm text-muted-foreground">Enhanced visualization and user experience for all solvers.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;

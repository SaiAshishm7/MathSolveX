import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MathSolveXLogo from './MathSolveXLogo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out py-4 px-6 md:px-8",
        scrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="rounded-lg flex items-center justify-center">
            <MathSolveXLogo className="w-10 h-10" />
          </div>
          <span className="font-display font-medium text-xl">MathSolveX</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "font-medium text-sm transition-colors",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-foreground/80 hover:text-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          <Button asChild>
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border">
          <div className="px-6 py-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "block font-medium text-sm transition-colors",
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-foreground/80 hover:text-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Button asChild className="w-full">
              <Link to="/dashboard" className="flex items-center justify-center space-x-2">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


import { ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
  onClick?: () => void;
}

const FeatureCard = ({ title, description, icon, className, onClick }: FeatureCardProps) => {
  return (
    <div 
      className={cn(
        "rounded-2xl p-6 hover-card neo-morphism transition-all h-full",
        onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-display text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export default FeatureCard;

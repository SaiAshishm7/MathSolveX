
import { cn } from "@/lib/utils";

interface Solution {
  variables: { name: string; value: number }[];
  objectiveValue: number;
  constraints?: { name: string; slack: number }[];
  method: string;
  iterations?: number;
  status: 'optimal' | 'unbounded' | 'infeasible' | 'multiple';
}

interface SolutionDisplayProps {
  solution: Solution;
  className?: string;
}

const SolutionDisplay = ({ solution, className }: SolutionDisplayProps) => {
  const getStatusColor = (status: Solution['status']) => {
    switch (status) {
      case 'optimal':
        return 'text-green-600';
      case 'unbounded':
        return 'text-amber-600';
      case 'infeasible':
        return 'text-red-600';
      case 'multiple':
        return 'text-blue-600';
      default:
        return 'text-foreground';
    }
  };

  const getStatusText = (status: Solution['status']) => {
    switch (status) {
      case 'optimal':
        return 'Optimal Solution Found';
      case 'unbounded':
        return 'Unbounded Solution';
      case 'infeasible':
        return 'No Feasible Solution';
      case 'multiple':
        return 'Multiple Optimal Solutions';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className={cn("rounded-xl border border-border p-6 bg-white shadow-soft", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div>
          <h3 className="text-lg font-medium">Solution Summary</h3>
          <p className="text-sm text-muted-foreground">
            Solved using {solution.method}
            {solution.iterations && ` in ${solution.iterations} iterations`}
          </p>
        </div>
        <div className={cn("px-4 py-1.5 rounded-full text-sm font-medium", getStatusColor(solution.status))}>
          {getStatusText(solution.status)}
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="solution-reveal">
          <h4 className="text-sm font-medium mb-2">Objective Value</h4>
          <div className="text-2xl font-display font-medium text-primary">
            {solution.objectiveValue.toFixed(4)}
          </div>
        </div>
        
        <div className="solution-reveal" style={{ animationDelay: '0.15s' }}>
          <h4 className="text-sm font-medium mb-2">Variable Values</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {solution.variables.map((variable, index) => (
              <div 
                key={index}
                className="rounded-lg bg-muted/50 p-3 flex justify-between items-center"
              >
                <span className="font-medium">{variable.name}</span>
                <span>{variable.value.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
        
        {solution.constraints && (
          <div className="solution-reveal" style={{ animationDelay: '0.3s' }}>
            <h4 className="text-sm font-medium mb-2">Constraint Slack</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {solution.constraints.map((constraint, index) => (
                <div 
                  key={index}
                  className="rounded-lg bg-muted/50 p-3 flex justify-between items-center"
                >
                  <span className="font-medium">{constraint.name}</span>
                  <span>{constraint.slack.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolutionDisplay;

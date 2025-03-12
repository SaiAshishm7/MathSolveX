import { useState, useEffect } from 'react';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BackButton from '@/components/BackButton';
import Footer from '@/components/Footer';
import GraphCanvas from '@/components/GraphCanvas';
import { toast } from "sonner";

type Constraint = {
  id: number;
  a: string;
  b: string;
  sign: '<=' | '>=' | '=';
  c: string;
};

type ObjectiveFunction = {
  a: string;
  b: string;
  type: 'min' | 'max';
};

type Point = {
  x: number;
  y: number;
};

const GraphicalMethod = () => {
  const [constraints, setConstraints] = useState<Constraint[]>([
    { id: 1, a: '1', b: '2', sign: '<=', c: '10' },
    { id: 2, a: '2', b: '1', sign: '<=', c: '8' },
  ]);
  const [objective, setObjective] = useState<ObjectiveFunction>({
    a: '3',
    b: '4',
    type: 'max',
  });
  const [nextId, setNextId] = useState(3);
  const [solution, setSolution] = useState<null | {
    x: number;
    y: number;
    value: number;
    point: string;
  }>(null);
  const [graphData, setGraphData] = useState({
    lines: [],
    region: [],
    points: [],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddConstraint = () => {
    setConstraints([
      ...constraints,
      { id: nextId, a: '', b: '', sign: '<=', c: '' },
    ]);
    setNextId(nextId + 1);
  };

  const handleRemoveConstraint = (id: number) => {
    if (constraints.length > 1) {
      setConstraints(constraints.filter((c) => c.id !== id));
    } else {
      toast.error("You need at least one constraint");
    }
  };

  const handleConstraintChange = (
    id: number,
    field: keyof Constraint,
    value: string
  ) => {
    setConstraints(
      constraints.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
  };

  const handleObjectiveChange = (field: keyof ObjectiveFunction, value: string) => {
    setObjective({ ...objective, [field]: value });
  };

  const parseConstraint = (constraint: Constraint) => {
    const a = parseFloat(constraint.a) || 0;
    const b = parseFloat(constraint.b) || 0;
    const c = parseFloat(constraint.c) || 0;
    return { a, b, c, sign: constraint.sign };
  };

  const findIntersection = (c1: { a: number; b: number; c: number }, c2: { a: number; b: number; c: number }): Point | null => {
    const det = c1.a * c2.b - c2.a * c1.b;
    
    if (Math.abs(det) < 1e-10) {
      return null;
    }
    
    const x = (c1.c * c2.b - c2.c * c1.b) / det;
    const y = (c1.a * c2.c - c2.a * c1.c) / det;
    
    return { x, y };
  };

  const satisfiesConstraints = (point: Point, constraints: Array<{ a: number; b: number; c: number; sign: string }>): boolean => {
    return constraints.every(constraint => {
      const { a, b, c, sign } = constraint;
      const value = a * point.x + b * point.y;
      
      switch(sign) {
        case '<=':
          return value <= c + 1e-10;
        case '>=':
          return value >= c - 1e-10;
        case '=':
          return Math.abs(value - c) < 1e-10;
        default:
          return false;
      }
    });
  };

  const addNonNegativityConstraints = (constraints: Array<{ a: number; b: number; c: number; sign: string }>) => {
    const nonNegativityX = { a: -1, b: 0, c: 0, sign: '<=' };
    const nonNegativityY = { a: 0, b: -1, c: 0, sign: '<=' };
    
    return [...constraints, nonNegativityX, nonNegativityY];
  };

  const generateGraphData = () => {
    const parsedConstraints = constraints.map(parseConstraint);
    const objA = parseFloat(objective.a) || 0;
    const objB = parseFloat(objective.b) || 0;
    
    const allConstraints = addNonNegativityConstraints(parsedConstraints);
    
    const lines = parsedConstraints.map((constraint, index) => {
      const { a, b, c } = constraint;
      
      let points = [];
      
      if (b === 0 && a !== 0) {
        const x = c / a;
        points = [{ x, y: -2 }, { x, y: 10 }];
      } else if (a === 0 && b !== 0) {
        const y = c / b;
        points = [{ x: -2, y }, { x: 10, y }];
      } else if (a !== 0 && b !== 0) {
        points = [
          { x: 0, y: c / b },
          { x: c / a, y: 0 }
        ];
      }
      
      return {
        points,
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4],
        dashed: false,
      };
    });
    
    lines.push({
      points: [{ x: 0, y: -2 }, { x: 0, y: 10 }],
      color: '#9CA3AF',
      dashed: true,
    });
    
    lines.push({
      points: [{ x: -2, y: 0 }, { x: 10, y: 0 }],
      color: '#9CA3AF',
      dashed: true,
    });
    
    const intersectionPoints: Point[] = [];
    
    for (let i = 0; i < allConstraints.length; i++) {
      for (let j = i + 1; j < allConstraints.length; j++) {
        const intersection = findIntersection(
          allConstraints[i],
          allConstraints[j]
        );
        
        if (intersection && 
            intersection.x >= -0.1 && intersection.y >= -0.1 &&
            intersection.x <= 10 && intersection.y <= 10) {
          
          if (satisfiesConstraints(intersection, allConstraints)) {
            intersection.x = Math.round(intersection.x * 10000) / 10000;
            intersection.y = Math.round(intersection.y * 10000) / 10000;
            
            const exists = intersectionPoints.some(p => 
              Math.abs(p.x - intersection.x) < 1e-8 && 
              Math.abs(p.y - intersection.y) < 1e-8
            );
            
            if (!exists) {
              intersectionPoints.push(intersection);
            }
          }
        }
      }
    }
    
    let optimalPoint: Point | null = null;
    let optimalValue = objective.type === 'max' ? -Infinity : Infinity;
    
    intersectionPoints.forEach(point => {
      const value = objA * point.x + objB * point.y;
      
      if ((objective.type === 'max' && value > optimalValue) ||
          (objective.type === 'min' && value < optimalValue)) {
        optimalValue = value;
        optimalPoint = point;
      }
    });
    
    if (intersectionPoints.length === 0) {
      toast.error("No feasible solution exists for these constraints");
      return;
    }
    
    const graphPoints = intersectionPoints.map(point => {
      const isOptimal = optimalPoint && 
                        Math.abs(point.x - optimalPoint.x) < 1e-8 && 
                        Math.abs(point.y - optimalPoint.y) < 1e-8;
      
      return {
        point,
        label: `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`,
        color: isOptimal ? '#10B981' : '#3B82F6'
      };
    });
    
    const regionPoints = [...intersectionPoints].sort((a, b) => {
      const center = {
        x: intersectionPoints.reduce((sum, p) => sum + p.x, 0) / intersectionPoints.length,
        y: intersectionPoints.reduce((sum, p) => sum + p.y, 0) / intersectionPoints.length
      };
      
      const angleA = Math.atan2(a.y - center.y, a.x - center.x);
      const angleB = Math.atan2(b.y - center.y, b.x - center.x);
      
      return angleA - angleB;
    });
    
    setGraphData({
      lines,
      region: [
        {
          points: regionPoints,
          color: 'rgba(59, 130, 246, 0.1)',
        },
      ],
      points: graphPoints,
    });
    
    if (optimalPoint) {
      const x = Math.round(optimalPoint.x * 100) / 100;
      const y = Math.round(optimalPoint.y * 100) / 100;
      const value = Math.round(optimalValue * 100) / 100;
      
      setSolution({
        x,
        y,
        value,
        point: `(${x}, ${y})`,
      });
      
      toast.success("Solution calculated successfully");
    } else {
      toast.error("Could not find an optimal solution");
    }
  };

  const handleSolve = () => {
    const isValid = constraints.every(c => 
      c.a.trim() !== '' && c.b.trim() !== '' && c.c.trim() !== ''
    ) && objective.a.trim() !== '' && objective.b.trim() !== '';
    
    if (!isValid) {
      toast.error("Please fill all constraint and objective values");
      return;
    }
    
    generateGraphData();
  };

  const handleReset = () => {
    setConstraints([
      { id: 1, a: '', b: '', sign: '<=', c: '' },
      { id: 2, a: '', b: '', sign: '<=', c: '' },
    ]);
    setObjective({ a: '', b: '', type: 'max' });
    setNextId(3);
    setSolution(null);
    setGraphData({ lines: [], region: [], points: [] });
    toast.info("Form reset successfully");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <BackButton />
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-medium mb-4">
              Graphical Method <span className="text-primary">Solver</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Solve two-variable linear programming problems visually
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="rounded-xl border border-border p-6 bg-white shadow-soft">
                <h2 className="text-xl font-display font-medium mb-4">Objective Function</h2>
                <div className="flex items-center space-x-3 mb-6">
                  <Select value={objective.type} onValueChange={(value) => handleObjectiveChange('type', value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="max">Max</SelectItem>
                      <SelectItem value="min">Min</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-lg">Z =</p>
                  <input
                    type="text"
                    value={objective.a}
                    onChange={(e) => handleObjectiveChange('a', e.target.value)}
                    className="w-16 h-10 rounded-md border border-input bg-background text-center focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="0"
                  />
                  <p className="text-lg">x₁ +</p>
                  <input
                    type="text"
                    value={objective.b}
                    onChange={(e) => handleObjectiveChange('b', e.target.value)}
                    className="w-16 h-10 rounded-md border border-input bg-background text-center focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="0"
                  />
                  <p className="text-lg">x₂</p>
                </div>
              </div>

              <div className="rounded-xl border border-border p-6 bg-white shadow-soft">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-display font-medium">Constraints</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddConstraint}
                    disabled={constraints.length >= 5}
                  >
                    Add Constraint
                  </Button>
                </div>

                <div className="space-y-4">
                  {constraints.map((constraint) => (
                    <div key={constraint.id} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={constraint.a}
                        onChange={(e) =>
                          handleConstraintChange(constraint.id, 'a', e.target.value)
                        }
                        className="w-16 h-10 rounded-md border border-input bg-background text-center focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="0"
                      />
                      <p className="text-lg">x₁ +</p>
                      <input
                        type="text"
                        value={constraint.b}
                        onChange={(e) =>
                          handleConstraintChange(constraint.id, 'b', e.target.value)
                        }
                        className="w-16 h-10 rounded-md border border-input bg-background text-center focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="0"
                      />
                      <p className="text-lg">x₂</p>
                      <Select
                        value={constraint.sign}
                        onValueChange={(value) =>
                          handleConstraintChange(constraint.id, 'sign', value)
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="<=">≤</SelectItem>
                          <SelectItem value=">=">≥</SelectItem>
                          <SelectItem value="=">=</SelectItem>
                        </SelectContent>
                      </Select>
                      <input
                        type="text"
                        value={constraint.c}
                        onChange={(e) =>
                          handleConstraintChange(constraint.id, 'c', e.target.value)
                        }
                        className="w-16 h-10 rounded-md border border-input bg-background text-center focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="0"
                      />
                      {constraints.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveConstraint(constraint.id)}
                          className="h-8 w-8"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                              fill="currentColor"
                            />
                          </svg>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-border mt-6 pt-6 flex space-x-3">
                  <Button onClick={handleSolve} className="flex-1">
                    Solve
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                </div>

                {solution && (
                  <div className="border-t border-border mt-6 pt-6 animate-fadeIn">
                    <h3 className="font-medium mb-2">Optimal Solution</h3>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">x₁ value</p>
                          <p className="font-medium">{solution.x}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">x₂ value</p>
                          <p className="font-medium">{solution.y}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Optimal point</p>
                          <p className="font-medium">{solution.point}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Objective value</p>
                          <p className="font-medium text-primary">{solution.value}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-border p-6 bg-white shadow-soft h-full">
                <h2 className="text-xl font-display font-medium mb-4">Graphical Representation</h2>
                <div className="h-[500px] flex items-center justify-center">
                  {graphData.lines.length > 0 ? (
                    <GraphCanvas
                      width={500}
                      height={500}
                      lines={graphData.lines}
                      regions={graphData.region}
                      points={graphData.points}
                      xRange={[-2, 10]}
                      yRange={[-2, 10]}
                      gridSize={1}
                      className="w-full"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <div className="mb-4 w-20 h-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                        <BarChart3 className="w-10 h-10 text-muted-foreground/50" />
                      </div>
                      <p>Enter constraints and objective function, then click Solve to visualize the solution.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GraphicalMethod;

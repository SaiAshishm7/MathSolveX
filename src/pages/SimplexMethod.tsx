import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackButton from '@/components/BackButton';
import Footer from '@/components/Footer';
import SolutionDisplay from '@/components/SolutionDisplay';
import MatrixInput from '@/components/MatrixInput';

const SimplexMethod = () => {
  const [variables, setVariables] = useState(2);
  const [constraints, setConstraints] = useState(2);
  const [objective, setObjective] = useState<number[]>(Array(variables).fill(0));
  const [constraintCoefficients, setConstraintCoefficients] = useState<number[][]>(
    Array(constraints).fill(null).map(() => Array(variables).fill(0))
  );
  const [constraintValues, setConstraintValues] = useState<number[]>(Array(constraints).fill(0));
  const [inequalityTypes, setInequalityTypes] = useState<string[]>(Array(constraints).fill('<='));
  const [optimizationType, setOptimizationType] = useState('maximize');
  const [solution, setSolution] = useState<any>(null);
  const [iterations, setIterations] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleObjectiveChange = (index: number, value: number) => {
    const newObjective = [...objective];
    newObjective[index] = value;
    setObjective(newObjective);
  };

  const handleConstraintCoefficientChange = (rowIndex: number, colIndex: number, value: number) => {
    const newConstraintCoefficients = [...constraintCoefficients.map(row => [...row])];
    newConstraintCoefficients[rowIndex][colIndex] = value;
    setConstraintCoefficients(newConstraintCoefficients);
  };

  const handleConstraintValueChange = (index: number, value: number) => {
    const newConstraintValues = [...constraintValues];
    newConstraintValues[index] = value;
    setConstraintValues(newConstraintValues);
  };

  const handleInequalityTypeChange = (index: number, value: string) => {
    const newInequalityTypes = [...inequalityTypes];
    newInequalityTypes[index] = value;
    setInequalityTypes(newInequalityTypes);
  };

  const updateProblemSize = () => {
    setObjective(Array(variables).fill(0));
    setConstraintCoefficients(
      Array(constraints).fill(null).map(() => Array(variables).fill(0))
    );
    setConstraintValues(Array(constraints).fill(0));
    setInequalityTypes(Array(constraints).fill('<='));
    setSolution(null);
    setIterations([]);
  };

  const solveSimplex = () => {
    setIsCalculating(true);
    
    try {
      // Convert inputs to the right format for the solver
      const objFn = [...objective];
      const A = [...constraintCoefficients.map(row => [...row])];
      const b = [...constraintValues];
      const inequalities = [...inequalityTypes];
      
      // Check if problem is valid
      if (objFn.some(isNaN) || A.some(row => row.some(isNaN)) || b.some(isNaN)) {
        throw new Error("Invalid input: All coefficients must be numbers");
      }
      
      // Implementation of two-phase simplex method (simplified for demonstration)
      const simplexSolver = () => {
        // Step 1: Convert to standard form
        const standardize = () => {
          const m = constraints; // number of constraints
          const n = variables; // number of original variables
          let numSlack = 0;
          let numArtificial = 0;
          
          // Count required slack and artificial variables
          inequalityTypes.forEach(type => {
            if (type === '<=') numSlack++;
            if (type === '>=' || type === '=') numArtificial++;
          });
          
          const totalVars = n + numSlack + numArtificial;
          const tableau = Array(m + 1).fill(0).map(() => Array(totalVars + 1).fill(0));
          
          // Set objective function coefficients
          for (let j = 0; j < n; j++) {
            tableau[0][j] = optimizationType === 'maximize' ? -objFn[j] : objFn[j];  // Negate for maximize
          }
          
          // Set constraint coefficients and handle slack/artificial variables
          let slackIndex = n;
          let artificialIndex = n + numSlack;
          
          for (let i = 0; i < m; i++) {
            // Original variables
            for (let j = 0; j < n; j++) {
              tableau[i + 1][j] = A[i][j];
            }
            
            // RHS
            tableau[i + 1][totalVars] = b[i];
            
            // Add slack/artificial variables
            switch (inequalities[i]) {
              case '<=':
                tableau[i + 1][slackIndex++] = 1;
                break;
              case '>=':
                tableau[i + 1][slackIndex++] = -1;
                tableau[i + 1][artificialIndex++] = 1;
                break;
              case '=':
                tableau[i + 1][artificialIndex++] = 1;
                break;
            }
          }
          
          return {
            tableau,
            numSlack,
            numArtificial,
            artificialStart: n + numSlack
          };
        };
        
        // Step 2: Phase I - Find initial basic feasible solution
        const phaseOne = (tableau, artificialStart, numArtificial) => {
          if (numArtificial === 0) return tableau;
          
          const m = tableau.length - 1;
          const n = tableau[0].length - 1;
          
          // Create Phase I objective function
          const w = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
          
          // Sum rows with artificial variables
          for (let i = 1; i <= m; i++) {
            if (inequalities[i - 1] === '>=' || inequalities[i - 1] === '=') {
              for (let j = 0; j <= n; j++) {
                w[0][j] += tableau[i][j];
              }
            }
          }
          
          // Perform simplex iterations for Phase I
          while (true) {
            // Find entering variable (most negative coefficient)
            let enterCol = -1;
            let minCoeff = -1e-10;
            
            for (let j = 0; j < n; j++) {
              if (w[0][j] < minCoeff) {
                minCoeff = w[0][j];
                enterCol = j;
              }
            }
            
            if (enterCol === -1) break;
            
            // Find leaving variable (minimum ratio test)
            let leaveRow = -1;
            let minRatio = Infinity;
            
            for (let i = 1; i <= m; i++) {
              if (tableau[i][enterCol] > 1e-10) {
                const ratio = tableau[i][n] / tableau[i][enterCol];
                if (ratio < minRatio) {
                  minRatio = ratio;
                  leaveRow = i;
                }
              }
            }
            
            if (leaveRow === -1) throw new Error("Problem is unbounded");
            
            // Pivot
            const pivot = tableau[leaveRow][enterCol];
            
            for (let j = 0; j <= n; j++) {
              tableau[leaveRow][j] /= pivot;
              w[0][j] -= w[0][enterCol] * tableau[leaveRow][j];
            }
            
            for (let i = 0; i <= m; i++) {
              if (i !== leaveRow) {
                const factor = tableau[i][enterCol];
                for (let j = 0; j <= n; j++) {
                  tableau[i][j] -= factor * tableau[leaveRow][j];
                }
              }
            }
          }
          
          // Check if Phase I solution is feasible
          if (Math.abs(w[0][n]) > 1e-10) {
            throw new Error("Problem is infeasible");
          }
          
          return tableau;
        };
        
        // Step 3: Phase II - Optimize the actual objective
        const phaseTwo = (tableau) => {
          const m = tableau.length - 1;
          const n = tableau[0].length - 1;
          
          while (true) {
            // Find entering variable (most negative coefficient)
            let enterCol = -1;
            let minCoeff = -1e-10;
            
            for (let j = 0; j < n; j++) {
              if (tableau[0][j] < minCoeff) {
                minCoeff = tableau[0][j];
                enterCol = j;
              }
            }
            
            if (enterCol === -1) break;
            
            // Find leaving variable (minimum ratio test)
            let leaveRow = -1;
            let minRatio = Infinity;
            
            for (let i = 1; i <= m; i++) {
              if (tableau[i][enterCol] > 1e-10) {
                const ratio = tableau[i][n] / tableau[i][enterCol];
                if (ratio < minRatio && ratio >= 0) {  // Added ratio >= 0 check
                  minRatio = ratio;
                  leaveRow = i;
                }
              }
            }
            
            if (leaveRow === -1) throw new Error("Problem is unbounded");
            
            // Pivot
            const pivot = tableau[leaveRow][enterCol];
            
            // Normalize pivot row
            for (let j = 0; j <= n; j++) {
              tableau[leaveRow][j] /= pivot;
            }
            
            // Update other rows
            for (let i = 0; i <= m; i++) {
              if (i !== leaveRow) {
                const factor = tableau[i][enterCol];
                for (let j = 0; j <= n; j++) {
                  tableau[i][j] -= factor * tableau[leaveRow][j];
                }
              }
            }
          }
          
          return tableau;
        };
        
        try {
          // Convert to standard form
          const { tableau, numSlack, numArtificial, artificialStart } = standardize();
          
          // Phase I (if needed)
          const phaseITableau = phaseOne(tableau, artificialStart, numArtificial);
          
          // Phase II
          const finalTableau = phaseTwo(phaseITableau);
          
          // Extract solution
          const solution = {
            status: 'optimal' as const,
            objectiveValue: optimizationType === 'maximize' ? 
              finalTableau[0][finalTableau[0].length - 1] :  // Remove the negation for maximize
              finalTableau[0][finalTableau[0].length - 1],
            variables: Array(variables).fill(0).map((_, i) => {
              // Find the row where this variable is basic
              let value = 0;
              for (let row = 1; row <= constraints; row++) {
                let isBasic = true;
                for (let col = 0; col < finalTableau[0].length - 1; col++) {
                  if (col === i) {
                    if (Math.abs(finalTableau[row][col] - 1) > 1e-10) isBasic = false;
                  } else {
                    if (Math.abs(finalTableau[row][col]) > 1e-10) isBasic = false;
                  }
                }
                if (isBasic) {
                  value = finalTableau[row][finalTableau[0].length - 1];
                  break;
                }
              }
              return {
                name: `x${i + 1}`,
                value: value
              };
            }),
            constraints: Array(constraints).fill(0).map((_, i) => ({
              name: `Constraint ${i + 1}`,
              slack: finalTableau[i + 1][finalTableau[0].length - 1]
            })),
            method: "Two-Phase Simplex",
            iterations: 0  // We could track this if needed
          };
          
          return { solution, iterations: [] };  // Iterations could be tracked if needed
          
        } catch (error) {
          if (error.message === "Problem is unbounded") {
            return {
              solution: {
                status: 'unbounded' as const,
                objectiveValue: optimizationType === 'maximize' ? Infinity : -Infinity,
                variables: [],
                method: "Two-Phase Simplex",
                iterations: 0
              },
              iterations: []
            };
          } else if (error.message === "Problem is infeasible") {
            return {
              solution: {
                status: 'infeasible' as const,
                objectiveValue: 0,
                variables: [],
                method: "Two-Phase Simplex",
                iterations: 0
              },
              iterations: []
            };
          } else {
            throw error;
          }
        }
      };
      
      // Solve the problem
      const result = simplexSolver();
      setSolution(result.solution);
      setIterations(result.iterations);
      
    } catch (error) {
      console.error("Error in simplex solver:", error);
      // Set error in solution
      setSolution({
        status: 'infeasible' as const,
        objectiveValue: 0,
        variables: [],
        method: "Two-Phase Simplex",
        iterations: 0
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <BackButton />
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="bg-muted/50 py-12">
          <div className="container mx-auto">
            <div className="flex items-center mb-8">
              <div className="mr-4 p-2 bg-primary/10 rounded-full">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Simplex Method Solver</h1>
                <p className="text-muted-foreground">
                  Solve linear programming problems using the Simplex algorithm
                </p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Problem Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Variables</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={variables}
                      onChange={(e) => setVariables(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Constraints</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={constraints}
                      onChange={(e) => setConstraints(parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Optimization Type</label>
                    <Select 
                      value={optimizationType} 
                      onValueChange={setOptimizationType}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maximize">Maximize</SelectItem>
                        <SelectItem value="minimize">Minimize</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={updateProblemSize}>Update Size</Button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Objective Function</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {optimizationType === 'maximize' ? 'Max Z = ' : 'Min Z = '}
                      {objective.map((coef, i) => (
                        <div key={`obj-${i}`} className="flex items-center">
                          {i > 0 && <span className="mx-1">+</span>}
                          <Input
                            type="number"
                            value={coef}
                            onChange={(e) => handleObjectiveChange(i, parseFloat(e.target.value))}
                            className="w-16 text-center"
                          />
                          <span className="ml-1">x<sub>{i+1}</sub></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Constraints</h3>
                    {Array(constraints).fill(0).map((_, rowIndex) => (
                      <div key={`constraint-${rowIndex}`} className="flex flex-wrap items-center gap-2 mb-3">
                        {Array(variables).fill(0).map((_, colIndex) => (
                          <div key={`coef-${rowIndex}-${colIndex}`} className="flex items-center">
                            {colIndex > 0 && <span className="mx-1">+</span>}
                            <Input
                              type="number"
                              value={constraintCoefficients[rowIndex]?.[colIndex] || 0}
                              onChange={(e) => handleConstraintCoefficientChange(
                                rowIndex, 
                                colIndex, 
                                parseFloat(e.target.value)
                              )}
                              className="w-16 text-center"
                            />
                            <span className="ml-1">x<sub>{colIndex+1}</sub></span>
                          </div>
                        ))}
                        <Select 
                          value={inequalityTypes[rowIndex] || '<='}
                          onValueChange={(value) => handleInequalityTypeChange(rowIndex, value)}
                        >
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="≤" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<=">≤</SelectItem>
                            <SelectItem value="=">=</SelectItem>
                            <SelectItem value=">=">≥</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={constraintValues[rowIndex] || 0}
                          onChange={(e) => handleConstraintValueChange(
                            rowIndex, 
                            parseFloat(e.target.value)
                          )}
                          className="w-16 text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    onClick={solveSimplex} 
                    disabled={isCalculating}
                    className="w-full"
                  >
                    {isCalculating ? 'Calculating...' : 'Solve using Simplex Method'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {solution && (
              <div className="mt-8">
                <Tabs defaultValue="solution">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="solution">Solution</TabsTrigger>
                    <TabsTrigger value="iterations">Iterations</TabsTrigger>
                  </TabsList>
                  <TabsContent value="solution">
                    <Card>
                      <CardHeader>
                        <CardTitle>Solution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              solution.status === 'optimal' ? 'bg-green-100 text-green-800' :
                              solution.status === 'unbounded' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {solution.status === 'optimal' ? 'Optimal Solution Found' :
                               solution.status === 'unbounded' ? 'Unbounded Solution' :
                               'No Feasible Solution'}
                            </span>
                          </div>
                          {solution.status === 'optimal' && (
                            <>
                              <p className="text-lg">
                                Objective Value: <span className="font-bold">{solution.objectiveValue.toFixed(4)}</span>
                              </p>
                              <div>
                                <p className="mb-2 font-medium">Variable Values:</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                  {solution.variables.map((variable: any, i: number) => (
                                    <div key={`var-${i}`} className="p-2 bg-muted rounded">
                                      {variable.name} = {variable.value.toFixed(4)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {solution.constraints && (
                                <div>
                                  <p className="mb-2 font-medium">Constraint Slack Values:</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                    {solution.constraints.map((constraint: any, i: number) => (
                                      <div key={`slack-${i}`} className="p-2 bg-muted rounded">
                                        {constraint.name}: {constraint.slack.toFixed(4)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="iterations">
                    <Card>
                      <CardHeader>
                        <CardTitle>Simplex Iterations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {iterations.map((iteration, i) => (
                            <div key={`iteration-${i}`}>
                              <h3 className="font-medium mb-2">Iteration {i+1}</h3>
                              <div className="overflow-auto">
                                <Table>
                                  <TableBody>
                                    {iteration.tableau.map((row: number[], rowIndex: number) => (
                                      <TableRow key={`tableau-${i}-${rowIndex}`}>
                                        {row.map((cell: number, cellIndex: number) => (
                                          <TableCell key={`cell-${i}-${rowIndex}-${cellIndex}`}>
                                            {cell.toFixed(2)}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                              {iteration.entering !== null && (
                                <p className="mt-2 text-sm">
                                  Entering: x<sub>{iteration.entering}</sub>, 
                                  Leaving: x<sub>{iteration.leaving}</sub>
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SimplexMethod;

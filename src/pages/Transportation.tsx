import { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import MatrixInput from '@/components/MatrixInput';

const Transportation = () => {
  const [sources, setSources] = useState(3);
  const [destinations, setDestinations] = useState(4);
  const [supply, setSupply] = useState<number[]>(Array(sources).fill(100));
  const [demand, setDemand] = useState<number[]>(Array(destinations).fill(75));
  const [costs, setCosts] = useState<number[][]>(
    Array(sources).fill(0).map(() => Array(destinations).fill(10))
  );
  const [solution, setSolution] = useState<any>(null);
  const [method, setMethod] = useState('northWest');
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSupplyChange = (index: number, value: number) => {
    const newSupply = [...supply];
    newSupply[index] = value;
    setSupply(newSupply);
  };

  const handleDemandChange = (index: number, value: number) => {
    const newDemand = [...demand];
    newDemand[index] = value;
    setDemand(newDemand);
  };

  const handleCostChange = (rowIndex: number, colIndex: number, value: number) => {
    const newCosts = [...costs.map(row => [...row])];
    newCosts[rowIndex][colIndex] = value;
    setCosts(newCosts);
  };

  const updateProblemSize = () => {
    setSupply(Array(sources).fill(100));
    setDemand(Array(destinations).fill(75));
    setCosts(
      Array(sources).fill(0).map(() => Array(destinations).fill(10))
    );
    setSolution(null);
  };

  const solveTransportation = () => {
    setIsCalculating(true);
    
    // Check if the problem is balanced
    const totalSupply = supply.reduce((a, b) => a + b, 0);
    const totalDemand = demand.reduce((a, b) => a + b, 0);
    
    // Create copies of supply and demand arrays
    let workingSupply = [...supply];
    let workingDemand = [...demand];
    let workingCosts = costs.map(row => [...row]);
    
    // Handle unbalanced problems by adding a dummy source/destination
    if (totalSupply > totalDemand) {
      workingDemand.push(totalSupply - totalDemand);
      workingCosts.forEach(row => row.push(0)); // Add dummy costs
    } else if (totalDemand > totalSupply) {
      workingSupply.push(totalDemand - totalSupply);
      workingCosts.push(Array(destinations).fill(0)); // Add dummy costs
    }
    
    const northWestCorner = () => {
      const allocation = Array(workingSupply.length).fill(0)
        .map(() => Array(workingDemand.length).fill(0));
      const remainingSupply = [...workingSupply];
      const remainingDemand = [...workingDemand];
      
      let i = 0, j = 0;
      
      // Handle degeneracy by adding small epsilon values
      const epsilon = 1e-10;
      
      while (i < workingSupply.length && j < workingDemand.length) {
        const quantity = Math.min(remainingSupply[i], remainingDemand[j]);
        
        if (quantity > 0) {
          allocation[i][j] = quantity;
          remainingSupply[i] -= quantity;
          remainingDemand[j] -= quantity;
        } else {
          // Add epsilon to handle degeneracy
          allocation[i][j] = epsilon;
          remainingSupply[i] -= epsilon;
          remainingDemand[j] -= epsilon;
        }
        
        if (Math.abs(remainingSupply[i]) < epsilon && i < workingSupply.length - 1) {
          i++;
        } else if (Math.abs(remainingDemand[j]) < epsilon && j < workingDemand.length - 1) {
          j++;
        } else {
          break;
        }
      }
      
      return allocation;
    };
    
    const minimumCost = () => {
      const allocation = Array(workingSupply.length).fill(0)
        .map(() => Array(workingDemand.length).fill(0));
      const remainingSupply = [...workingSupply];
      const remainingDemand = [...workingDemand];
      
      // Handle degeneracy
      const epsilon = 1e-10;
      const isDegenerate = () => {
        const numPositiveAllocations = allocation.flat().filter(x => x > epsilon).length;
        return numPositiveAllocations < workingSupply.length + workingDemand.length - 1;
      };
      
      while (remainingSupply.some(s => s > epsilon) && remainingDemand.some(d => d > epsilon)) {
        let minCost = Infinity;
        let minI = 0, minJ = 0;
        
        // Find cell with minimum cost
        for (let i = 0; i < workingSupply.length; i++) {
          if (remainingSupply[i] <= epsilon) continue;
          
          for (let j = 0; j < workingDemand.length; j++) {
            if (remainingDemand[j] <= epsilon) continue;
            
            if (workingCosts[i][j] < minCost) {
              minCost = workingCosts[i][j];
              minI = i;
              minJ = j;
            }
          }
        }
        
        // Allocate maximum possible quantity
        const quantity = Math.min(remainingSupply[minI], remainingDemand[minJ]);
        allocation[minI][minJ] = quantity;
        remainingSupply[minI] -= quantity;
        remainingDemand[minJ] -= quantity;
        
        // Handle degeneracy if needed
        if (isDegenerate()) {
          for (let i = 0; i < workingSupply.length; i++) {
            for (let j = 0; j < workingDemand.length; j++) {
              if (allocation[i][j] === 0 && remainingSupply[i] > epsilon && remainingDemand[j] > epsilon) {
                allocation[i][j] = epsilon;
                remainingSupply[i] -= epsilon;
                remainingDemand[j] -= epsilon;
                break;
              }
            }
          }
        }
      }
      
      return allocation;
    };
    
    const vogelsApproximation = () => {
      const allocation = Array(workingSupply.length).fill(0)
        .map(() => Array(workingDemand.length).fill(0));
      const remainingSupply = [...workingSupply];
      const remainingDemand = [...workingDemand];
      
      const epsilon = 1e-10;
      const activeRows = Array(workingSupply.length).fill(true);
      const activeCols = Array(workingDemand.length).fill(true);
      
      // Calculate penalties for a row/column
      const calculatePenalty = (costs: number[], active: boolean[]) => {
        const validCosts = costs.filter((_, i) => active[i]);
        if (validCosts.length <= 1) return 0;
        
        const sorted = [...validCosts].sort((a, b) => a - b);
        return sorted[1] - sorted[0];
      };
      
      while (remainingSupply.some(s => s > epsilon) && remainingDemand.some(d => d > epsilon)) {
        // Calculate row and column penalties
        const rowPenalties = workingCosts.map((row, i) => 
          activeRows[i] && remainingSupply[i] > epsilon
            ? calculatePenalty(row.filter((_, j) => activeCols[j]), activeCols)
            : -1
        );
        
        const colPenalties = Array(workingDemand.length).fill(0).map((_, j) =>
          activeCols[j] && remainingDemand[j] > epsilon
            ? calculatePenalty(workingCosts.map(row => row[j]).filter((_, i) => activeRows[i]), activeRows)
            : -1
        );
        
        // Find maximum penalty
        const maxRowPenalty = Math.max(...rowPenalties);
        const maxColPenalty = Math.max(...colPenalties);
        
        let selectedI = -1, selectedJ = -1;
        
        if (maxRowPenalty >= maxColPenalty && maxRowPenalty > -1) {
          selectedI = rowPenalties.indexOf(maxRowPenalty);
          // Find minimum cost in selected row
          selectedJ = workingCosts[selectedI]
            .map((cost, j) => ({ cost, j }))
            .filter(({ j }) => activeCols[j] && remainingDemand[j] > epsilon)
            .reduce((min, curr) => curr.cost < min.cost ? curr : min, { cost: Infinity, j: -1 })
            .j;
        } else if (maxColPenalty > -1) {
          selectedJ = colPenalties.indexOf(maxColPenalty);
          // Find minimum cost in selected column
          selectedI = workingCosts
            .map((row, i) => ({ cost: row[selectedJ], i }))
            .filter(({ i }) => activeRows[i] && remainingSupply[i] > epsilon)
            .reduce((min, curr) => curr.cost < min.cost ? curr : min, { cost: Infinity, i: -1 })
            .i;
        } else {
          break;
        }
        
        if (selectedI === -1 || selectedJ === -1) break;
        
        // Allocate
        const quantity = Math.min(remainingSupply[selectedI], remainingDemand[selectedJ]);
        allocation[selectedI][selectedJ] = quantity;
        remainingSupply[selectedI] -= quantity;
        remainingDemand[selectedJ] -= quantity;
        
        // Update active rows/columns
        if (remainingSupply[selectedI] <= epsilon) activeRows[selectedI] = false;
        if (remainingDemand[selectedJ] <= epsilon) activeCols[selectedJ] = false;
      }
      
      return allocation;
    };
    
    let allocation;
    switch (method) {
      case 'northWest':
        allocation = northWestCorner();
        break;
      case 'minCost':
        allocation = minimumCost();
        break;
      case 'vam':
        allocation = vogelsApproximation();
        break;
      default:
        allocation = northWestCorner();
    }
    
    // Calculate total cost
    let totalCost = 0;
    for (let i = 0; i < allocation.length; i++) {
      for (let j = 0; j < allocation[i].length; j++) {
        totalCost += allocation[i][j] * workingCosts[i][j];
      }
    }
    
    // Remove dummy allocations from the result if problem was unbalanced
    if (totalSupply !== totalDemand) {
      if (totalSupply > totalDemand) {
        allocation = allocation.map(row => row.slice(0, -1));
      } else {
        allocation = allocation.slice(0, -1);
      }
    }
    
    // Calculate total cost and set solution
    setSolution({
      allocation,
      totalCost,
      method: method === 'northWest' ? 'North-West Corner' : 
              method === 'minCost' ? 'Minimum Cost' : 'Vogel\'s Approximation',
      balanced: Math.abs(totalSupply - totalDemand) < 1e-10
    });
    
    setIsCalculating(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <BackButton />
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="bg-muted/50 py-12">
          <div className="container mx-auto">
            <div className="flex items-center mb-8">
              <div className="mr-4 p-2 bg-primary/10 rounded-full">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Transportation Problem Solver</h1>
                <p className="text-muted-foreground">
                  Optimize distribution networks and minimize transportation costs
                </p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Problem Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Sources</label>
                    <Input
                      type="number"
                      min="2"
                      max="10"
                      value={sources}
                      onChange={(e) => setSources(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Destinations</label>
                    <Input
                      type="number"
                      min="2"
                      max="10"
                      value={destinations}
                      onChange={(e) => setDestinations(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Initial Solution Method</label>
                    <Tabs value={method} onValueChange={setMethod} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="northWest">NW</TabsTrigger>
                        <TabsTrigger value="minCost">Min Cost</TabsTrigger>
                        <TabsTrigger value="vam">VAM</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
                
                <div className="flex justify-end mb-6">
                  <Button onClick={updateProblemSize}>Update Size</Button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Transportation Costs</h3>
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sources \ Destinations</TableHead>
                            {Array(destinations).fill(0).map((_, j) => (
                              <TableHead key={`dest-${j}`}>D{j+1}</TableHead>
                            ))}
                            <TableHead>Supply</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Array(sources).fill(0).map((_, i) => (
                            <TableRow key={`source-${i}`}>
                              <TableCell>S{i+1}</TableCell>
                              {Array(destinations).fill(0).map((_, j) => (
                                <TableCell key={`cost-${i}-${j}`}>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={costs[i]?.[j] || 0}
                                    onChange={(e) => handleCostChange(i, j, parseInt(e.target.value))}
                                    className="w-16 text-center"
                                  />
                                </TableCell>
                              ))}
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  value={supply[i] || 0}
                                  onChange={(e) => handleSupplyChange(i, parseInt(e.target.value))}
                                  className="w-20 text-center"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell>Demand</TableCell>
                            {Array(destinations).fill(0).map((_, j) => (
                              <TableCell key={`demand-${j}`}>
                                <Input
                                  type="number"
                                  min="0"
                                  value={demand[j] || 0}
                                  onChange={(e) => handleDemandChange(j, parseInt(e.target.value))}
                                  className="w-20 text-center"
                                />
                              </TableCell>
                            ))}
                            <TableCell>
                              {Math.abs(supply.reduce((a, b) => a + b, 0) - demand.reduce((a, b) => a + b, 0)) < 1e-10 ? (
                                <span className="text-green-500">Balanced</span>
                              ) : (
                                <span className="text-yellow-500">Unbalanced</span>
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    onClick={solveTransportation} 
                    disabled={isCalculating}
                    className="w-full"
                  >
                    {isCalculating ? 'Calculating...' : 'Solve Transportation Problem'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {solution && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Solution ({solution.method})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      {solution.balanced 
                        ? 'The problem is balanced.' 
                        : 'The problem is unbalanced and has been balanced by adding a dummy source/destination.'}
                    </p>
                    <p className="font-medium">Total Transportation Cost: <span className="text-primary">{solution.totalCost}</span></p>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Allocation Plan</h3>
                      <div className="overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Sources \ Destinations</TableHead>
                              {Array(destinations).fill(0).map((_, j) => (
                                <TableHead key={`sol-dest-${j}`}>D{j+1}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {solution.allocation.map((row: number[], i: number) => (
                              <TableRow key={`sol-source-${i}`}>
                                <TableCell>S{i+1}</TableCell>
                                {row.map((quantity: number, j: number) => (
                                  <TableCell key={`sol-alloc-${i}-${j}`} className="text-center">
                                    {quantity > 0 ? (
                                      <div>
                                        <div className="font-bold">{quantity}</div>
                                        <div className="text-xs text-muted-foreground">(₹{costs[i][j]})</div>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Transportation;

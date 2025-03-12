import { useState, useEffect } from 'react';
import { TruckIcon, PackageIcon, FactoryIcon, DollarSignIcon, BarChart3Icon, TrendingUpIcon, InfoIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Sankey,
  Rectangle,
} from 'recharts';
import BackButton from '@/components/BackButton';

// Supply Chain Optimization for Car Manufacturing
const WorkforceOptimization = () => {
  const { toast } = useToast();
  
  // Suppliers data
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Supplier A', capacity: 1000, costPerUnit: 500 },
    { id: 2, name: 'Supplier B', capacity: 800, costPerUnit: 450 },
    { id: 3, name: 'Supplier C', capacity: 1200, costPerUnit: 550 }
  ]);

  // Factories data
  const [factories, setFactories] = useState([
    { id: 1, name: 'Factory X', capacity: 900, productionCost: 2000 },
    { id: 2, name: 'Factory Y', capacity: 1100, productionCost: 2200 }
  ]);

  // Transportation costs between suppliers and factories
  const [transportCosts, setTransportCosts] = useState([
    [100, 150], // Supplier A to Factory X, Y
    [120, 100], // Supplier B to Factory X, Y
    [80, 170]   // Supplier C to Factory X, Y
  ]);

  // Market demand
  const [marketDemand, setMarketDemand] = useState(1500);
  
  // Sale price per unit
  const [salePrice, setSalePrice] = useState(3500);
  
  // Results state
  const [solution, setSolution] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Solve the supply chain optimization problem
  const solveSupplyChain = () => {
    setIsCalculating(true);

    // Implementation of supply chain optimization
    try {
      // Calculate optimal allocation using a simplified linear programming approach
      const allocation = optimizeAllocation();
      
      // Calculate total costs
      let totalCost = 0;
      let totalProduction = 0;
      const supplierUtilization = new Array(suppliers.length).fill(0);
      const factoryUtilization = new Array(factories.length).fill(0);
      
      allocation.forEach((row, supplierId) => {
        row.forEach((quantity, factoryId) => {
          // Add supplier costs
          totalCost += quantity * suppliers[supplierId].costPerUnit;
          // Add transportation costs
          totalCost += quantity * transportCosts[supplierId][factoryId];
          // Add production costs
          totalCost += quantity * factories[factoryId].productionCost;
          
          // Track utilization
          supplierUtilization[supplierId] += quantity;
          factoryUtilization[factoryId] += quantity;
          totalProduction += quantity;
        });
      });

      const costPerUnit = totalCost / totalProduction;
      const totalRevenue = totalProduction * salePrice;
      const totalProfit = totalRevenue - totalCost;
      const profitPerUnit = totalProfit / totalProduction;
      const profitMargin = (profitPerUnit / salePrice) * 100;

      setSolution({
        allocation,
        totalCost,
        totalProduction,
        supplierUtilization,
        factoryUtilization,
        salePrice,
        totalRevenue,
        totalProfit,
        profitPerUnit,
        profitMargin,
        costPerUnit,
        message: `Optimal solution found:
          - Total Production: ${totalProduction} units
          - Total Cost: Rs${totalCost.toLocaleString()}
          - Average Cost per Unit: Rs${costPerUnit.toFixed(2)}
          - Total Revenue: Rs${totalRevenue.toLocaleString()}
          - Total Profit: Rs${totalProfit.toLocaleString()}
          - Profit per Unit: Rs${profitPerUnit.toFixed(2)}
          - Profit Margin: ${profitMargin.toFixed(2)}%
          - Supplier Utilization: ${supplierUtilization.map((u, i) => `${suppliers[i].name}: ${u}`).join(', ')}
          - Factory Utilization: ${factoryUtilization.map((u, i) => `${factories[i].name}: ${u}`).join(', ')}`
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Optimization Error",
        description: "Failed to find optimal solution. Please check constraints."
      });
    }
    
    setIsCalculating(false);
  };

  // Optimization algorithm
  const optimizeAllocation = () => {
    // Initialize allocation matrix
    const allocation = Array(suppliers.length).fill(0).map(() => 
      Array(factories.length).fill(0)
    );

    // Simple greedy algorithm for initial solution
    let remainingDemand = marketDemand;
    
    // Sort suppliers by total cost (supply + transport + production)
    const supplierCosts = suppliers.map((supplier, sId) => ({
      id: sId,
      costs: factories.map((factory, fId) => ({
        fId,
        totalCost: supplier.costPerUnit + transportCosts[sId][fId] + factory.productionCost
      }))
    }));

    // Allocate based on lowest total cost
    while (remainingDemand > 0) {
      let bestCost = Infinity;
      let bestSupplier = -1;
      let bestFactory = -1;

      supplierCosts.forEach(({ id: sId, costs }) => {
        const supplier = suppliers[sId];
        const remainingSupply = supplier.capacity - allocation[sId].reduce((a, b) => a + b, 0);
        
        if (remainingSupply > 0) {
          costs.forEach(({ fId, totalCost }) => {
            const factory = factories[fId];
            const remainingCapacity = factory.capacity - allocation.reduce((sum, row) => sum + row[fId], 0);
            
            if (remainingCapacity > 0 && totalCost < bestCost) {
              bestCost = totalCost;
              bestSupplier = sId;
              bestFactory = fId;
            }
          });
        }
      });

      if (bestSupplier === -1 || bestFactory === -1) break;

      const supplier = suppliers[bestSupplier];
      const factory = factories[bestFactory];
      const remainingSupply = supplier.capacity - allocation[bestSupplier].reduce((a, b) => a + b, 0);
      const remainingCapacity = factory.capacity - allocation.reduce((sum, row) => sum + row[bestFactory], 0);
      
      const quantity = Math.min(remainingDemand, remainingSupply, remainingCapacity);
      allocation[bestSupplier][bestFactory] += quantity;
      remainingDemand -= quantity;
    }

    return allocation;
  };

  // Run initial calculation
  useEffect(() => {
    solveSupplyChain();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <BackButton />
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="bg-muted/50 py-12">
          <div className="container mx-auto">
            <div className="flex items-center mb-8">
              <div className="mr-4 p-2 bg-primary/10 rounded-full">
                <TruckIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Car Manufacturing Supply Chain Optimizer</h1>
                <p className="text-muted-foreground">
                  Optimize supply chain costs and efficiency across suppliers, transportation, and factories
                </p>
              </div>
            </div>

            {/* About Box */}
            <Card className="mb-8 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <InfoIcon className="h-5 w-5 text-blue-500" />
                  How This Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Basic Explanation */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-blue-700">What This Tool Does:</h3>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-blue-500 mt-1">1.</span>
                          <span>Takes your car production target (how many cars you need)</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-blue-500 mt-1">2.</span>
                          <span>Looks at available suppliers (who can provide parts) and their costs</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-blue-500 mt-1">3.</span>
                          <span>Checks factory capacities and their production costs</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-blue-500 mt-1">4.</span>
                          <span>Considers transportation costs between suppliers and factories</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-blue-500 mt-1">5.</span>
                          <span>Finds the cheapest way to make your cars while meeting all requirements</span>
                        </p>
                      </div>
                    </div>

                    {/* Right Column: How to Use */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-blue-700">How to Use:</h3>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-green-500 mt-1">1.</span>
                          <span>Set your target production (Market Demand)</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-green-500 mt-1">2.</span>
                          <span>Adjust supplier capacities and costs if needed</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-green-500 mt-1">3.</span>
                          <span>Modify factory capacities and production costs if needed</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-green-500 mt-1">4.</span>
                          <span>Update transportation costs between locations if needed</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-green-500 mt-1">5.</span>
                          <span>Click "Optimize Supply Chain" to get your results</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Results Explanation */}
                  <div className="pt-4 border-t border-blue-100">
                    <h3 className="font-medium text-blue-700 mb-2">Understanding Results:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-start gap-2">
                        <BarChart3Icon className="h-4 w-4 text-purple-500 mt-1" />
                        <span><span className="font-medium">Production Stats:</span> Shows total cars produced and average cost per car</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <PackageIcon className="h-4 w-4 text-blue-500 mt-1" />
                        <span><span className="font-medium">Supplier Usage:</span> Shows how much each supplier is utilized</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FactoryIcon className="h-4 w-4 text-green-500 mt-1" />
                        <span><span className="font-medium">Factory Usage:</span> Shows how much each factory produces</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>Supply Chain Parameters</CardTitle>
                  <CardDescription>
                    Configure suppliers, factories, and market demand
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Market Parameters</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">Market Demand</label>
                          <div className="flex gap-4 items-center">
                            <Slider
                              value={[marketDemand]}
                              min={500}
                              max={3000}
                              step={100}
                              onValueChange={(vals) => setMarketDemand(vals[0])}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={marketDemand}
                              onChange={(e) => setMarketDemand(Number(e.target.value))}
                              className="w-24"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">Sale Price per Unit (Rs)</label>
                          <div className="flex gap-4 items-center">
                            <Slider
                              value={[salePrice]}
                              min={2000}
                              max={5000}
                              step={100}
                              onValueChange={(vals) => setSalePrice(vals[0])}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={salePrice}
                              onChange={(e) => setSalePrice(Number(e.target.value))}
                              className="w-24"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Suppliers</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Cost per Unit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {suppliers.map((supplier) => (
                            <TableRow key={supplier.id}>
                              <TableCell>{supplier.name}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={supplier.capacity}
                                  onChange={(e) => {
                                    const newSuppliers = [...suppliers];
                                    newSuppliers[supplier.id - 1].capacity = Number(e.target.value);
                                    setSuppliers(newSuppliers);
                                  }}
                                  className="w-24"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={supplier.costPerUnit}
                                  onChange={(e) => {
                                    const newSuppliers = [...suppliers];
                                    newSuppliers[supplier.id - 1].costPerUnit = Number(e.target.value);
                                    setSuppliers(newSuppliers);
                                  }}
                                  className="w-24"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Factories</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Factory</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Production Cost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {factories.map((factory) => (
                            <TableRow key={factory.id}>
                              <TableCell>{factory.name}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={factory.capacity}
                                  onChange={(e) => {
                                    const newFactories = [...factories];
                                    newFactories[factory.id - 1].capacity = Number(e.target.value);
                                    setFactories(newFactories);
                                  }}
                                  className="w-24"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={factory.productionCost}
                                  onChange={(e) => {
                                    const newFactories = [...factories];
                                    newFactories[factory.id - 1].productionCost = Number(e.target.value);
                                    setFactories(newFactories);
                                  }}
                                  className="w-24"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Transportation Costs</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Supplier</TableHead>
                            {factories.map((factory) => (
                              <TableHead key={factory.id}>{factory.name}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {suppliers.map((supplier, sId) => (
                            <TableRow key={supplier.id}>
                              <TableCell>{supplier.name}</TableCell>
                              {transportCosts[sId].map((cost, fId) => (
                                <TableCell key={fId}>
                                  <Input
                                    type="number"
                                    value={cost}
                                    onChange={(e) => {
                                      const newCosts = transportCosts.map(row => [...row]);
                                      newCosts[sId][fId] = Number(e.target.value);
                                      setTransportCosts(newCosts);
                                    }}
                                    className="w-24"
                                  />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <Button
                      onClick={solveSupplyChain}
                      disabled={isCalculating}
                      className="w-full"
                    >
                      {isCalculating ? 'Optimizing Supply Chain...' : 'Optimize Supply Chain'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {solution && (
                <Card className="bg-gradient-to-br from-white to-gray-50 shadow-lg">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <TrendingUpIcon className="h-5 w-5" />
                      Optimal Solution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* Production Stats */}
                      <div className="rounded-lg bg-primary/5 p-4">
                        <h3 className="flex items-center gap-2 text-lg font-medium text-primary mb-3">
                          <BarChart3Icon className="h-5 w-5" />
                          Production & Profit Analysis
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Production:</span>
                            <span className="font-semibold">{solution.totalProduction} units</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Cost per Unit:</span>
                            <span className="font-semibold">₹{solution.costPerUnit.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Sale Price per Unit:</span>
                            <span className="font-semibold">₹{solution.salePrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Profit per Unit:</span>
                            <span className="font-semibold text-green-600">₹{solution.profitPerUnit.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Profit Margin:</span>
                            <span className="font-semibold text-green-600">{solution.profitMargin.toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div className="rounded-lg bg-green-50 p-4">
                        <h3 className="flex items-center gap-2 text-lg font-medium text-green-700 mb-3">
                          <DollarSignIcon className="h-5 w-5" />
                          Financial Summary
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-green-600">Total Cost:</span>
                            <span className="font-semibold text-green-700">₹{solution.totalCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-600">Total Revenue:</span>
                            <span className="font-semibold text-green-700">₹{solution.totalRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-600">Total Profit:</span>
                            <span className="font-semibold text-green-700">₹{solution.totalProfit.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Supplier Utilization */}
                      <div className="rounded-lg bg-blue-50 p-4">
                        <h3 className="flex items-center gap-2 text-lg font-medium text-blue-700 mb-3">
                          <PackageIcon className="h-5 w-5" />
                          Supplier Utilization
                        </h3>
                        <div className="space-y-3">
                          {solution.supplierUtilization.map((utilization, index) => {
                            const supplier = suppliers[index];
                            const utilizationPercent = (utilization / supplier.capacity) * 100;
                            return (
                              <div key={supplier.id} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-blue-600">{supplier.name}</span>
                                  <span className="text-blue-700 font-medium">
                                    {utilization} / {supplier.capacity} units
                                  </span>
                                </div>
                                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${utilizationPercent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Factory Utilization */}
                      <div className="rounded-lg bg-purple-50 p-4">
                        <h3 className="flex items-center gap-2 text-lg font-medium text-purple-700 mb-3">
                          <FactoryIcon className="h-5 w-5" />
                          Factory Utilization
                        </h3>
                        <div className="space-y-3">
                          {solution.factoryUtilization.map((utilization, index) => {
                            const factory = factories[index];
                            const utilizationPercent = (utilization / factory.capacity) * 100;
                            return (
                              <div key={factory.id} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-purple-600">{factory.name}</span>
                                  <span className="text-purple-700 font-medium">
                                    {utilization} / {factory.capacity} units
                                  </span>
                                </div>
                                <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                                    style={{ width: `${utilizationPercent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {solution && (
              <>
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Supply Chain Flow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={suppliers.map((supplier, sId) => ({
                            name: supplier.name,
                            capacity: supplier.capacity,
                            utilized: solution.supplierUtilization[sId],
                            cost: solution.allocation[sId].reduce((sum, qty, fId) => 
                              sum + qty * (supplier.costPerUnit + transportCosts[sId][fId] + factories[fId].productionCost), 0
                            )
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="utilized" name="Units Supplied" fill="#8884d8" />
                          <Bar yAxisId="right" dataKey="cost" name="Total Cost (Rs)" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkforceOptimization; 
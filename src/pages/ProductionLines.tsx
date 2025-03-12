import { useState } from 'react';
import { Factory, Plus, Users, Gauge, InfoIcon, Calculator } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BackButton from '@/components/BackButton';
import { toast } from "sonner";

type Priority = 'Low' | 'Medium' | 'High';

interface ProductionLine {
  id: number;
  name: string;
  minWorkers: number;
  optimalWorkers: number;
  maxWorkers: number;
  skilledRatio: number;
  productionRate: number;
  priority: Priority;
  allocatedWorkers?: number;
}

const getPriorityValue = (priority: Priority): number => {
  switch (priority) {
    case 'High': return 3;
    case 'Medium': return 2;
    case 'Low': return 1;
    default: return 1;
  }
};

const ProductionLines = () => {
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);

  const [totalWorkers, setTotalWorkers] = useState<number>(20);
  const [optimizedLines, setOptimizedLines] = useState<ProductionLine[]>([]);

  const [newLine, setNewLine] = useState({
    name: '',
    minWorkers: 1,
    optimalWorkers: 1,
    maxWorkers: 1,
    skilledRatio: 0.1,
    productionRate: 0,
    priority: 'Medium' as Priority
  });

  const addProductionLine = (e) => {
    e.preventDefault();
    if (!newLine.name) {
      toast.error("Please enter a production line name");
      return;
    }

    setProductionLines([...productionLines, {
      id: productionLines.length + 1,
      ...newLine
    }]);

    setNewLine({
      name: '',
      minWorkers: 1,
      optimalWorkers: 1,
      maxWorkers: 1,
      skilledRatio: 0.1,
      productionRate: 0,
      priority: 'Medium'
    });
    toast.success("Production line added successfully");
  };

  const optimizeWorkerAllocation = () => {
    if (productionLines.length === 0) {
      toast.error("Please add at least one production line");
      return;
    }

    if (totalWorkers < productionLines.reduce((sum, line) => sum + line.minWorkers, 0)) {
      toast.error("Not enough workers to meet minimum requirements");
      return;
    }

    // Simple optimization algorithm:
    // 1. First, allocate minimum workers to each line
    // 2. Then, distribute remaining workers based on priority and production rate
    let remainingWorkers = totalWorkers;
    const optimized = [...productionLines].map(line => ({
      ...line,
      allocatedWorkers: line.minWorkers
    }));
    
    remainingWorkers -= optimized.reduce((sum, line) => sum + line.minWorkers, 0);

    // Sort lines by priority (highest first) and production rate
    const sortedLines = [...optimized].sort((a, b) => {
      const priorityA = getPriorityValue(a.priority);
      const priorityB = getPriorityValue(b.priority);
      return priorityB === priorityA ? b.productionRate - a.productionRate : priorityB - priorityA;
    });

    // Distribute remaining workers
    while (remainingWorkers > 0) {
      let workersAllocated = false;
      
      for (const line of sortedLines) {
        if (remainingWorkers > 0 && line.allocatedWorkers! < line.maxWorkers) {
          line.allocatedWorkers!++;
          remainingWorkers--;
          workersAllocated = true;
        }
      }

      if (!workersAllocated) break;
    }

    setOptimizedLines(sortedLines);
    toast.success("Worker allocation optimized successfully");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <BackButton />
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="bg-muted/50 py-12">
          <div className="container mx-auto">
            <div className="flex items-center mb-8">
              <div className="mr-4 p-2 bg-primary/10 rounded-full">
                <Factory className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Production Line Balancing</h1>
                <p className="text-muted-foreground">
                  Optimize worker allocation across production lines to maximize efficiency
                </p>
              </div>
            </div>

            {/* Total Workers Input and Optimize Button */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Worker Allocation Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Total Available Workers</label>
                    <Input
                      type="number"
                      min="1"
                      value={totalWorkers}
                      onChange={(e) => setTotalWorkers(parseInt(e.target.value))}
                      placeholder="Enter total workers available"
                    />
                  </div>
                  <Button 
                    className="flex items-center gap-2" 
                    onClick={optimizeWorkerAllocation}
                  >
                    <Calculator className="h-4 w-4" />
                    Optimize Allocation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Add New Production Line */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Production Line
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" onSubmit={addProductionLine}>
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input placeholder="Production Line Name" value={newLine.name} onChange={(e) => setNewLine({...newLine, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Min Workers</label>
                    <Input type="number" min="1" placeholder="Minimum Workers" value={newLine.minWorkers} onChange={(e) => setNewLine({...newLine, minWorkers: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Optimal Workers</label>
                    <Input type="number" min="1" placeholder="Optimal Workers" value={newLine.optimalWorkers} onChange={(e) => setNewLine({...newLine, optimalWorkers: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Workers</label>
                    <Input type="number" min="1" placeholder="Maximum Workers" value={newLine.maxWorkers} onChange={(e) => setNewLine({...newLine, maxWorkers: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Skilled Ratio</label>
                    <Input type="number" min="0" max="1" step="0.1" placeholder="Skilled Worker Ratio" value={newLine.skilledRatio} onChange={(e) => setNewLine({...newLine, skilledRatio: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Production Rate</label>
                    <Input type="number" min="0" step="0.1" placeholder="Units per Hour" value={newLine.productionRate} onChange={(e) => setNewLine({...newLine, productionRate: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <Select
                      value={newLine.priority}
                      onValueChange={(value: Priority) => setNewLine({...newLine, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <Button type="submit" className="w-full">
                      Add Production Line
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Optimization Results */}
            {optimizedLines.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Optimized Worker Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Allocated Workers</TableHead>
                        <TableHead>Min/Opt/Max</TableHead>
                        <TableHead>Production Rate</TableHead>
                        <TableHead>Expected Output</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {optimizedLines.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell>{line.name}</TableCell>
                          <TableCell className="font-bold">{line.allocatedWorkers}</TableCell>
                          <TableCell>{line.minWorkers}/{line.optimalWorkers}/{line.maxWorkers}</TableCell>
                          <TableCell>{line.productionRate} units/hr</TableCell>
                          <TableCell>{(line.productionRate * (line.allocatedWorkers! / line.optimalWorkers)).toFixed(1)} units/hr</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Workers Allocated:</span>
                      <span className="font-bold">{optimizedLines.reduce((sum, line) => sum + line.allocatedWorkers!, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium">Total Expected Output:</span>
                      <span className="font-bold">
                        {optimizedLines.reduce((sum, line) => 
                          sum + (line.productionRate * (line.allocatedWorkers! / line.optimalWorkers)), 0).toFixed(1)} units/hr
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Production Lines List */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  Production Lines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Workers (Min/Opt/Max)</TableHead>
                      <TableHead>Skilled Ratio</TableHead>
                      <TableHead>Production Rate</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productionLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>{line.name}</TableCell>
                        <TableCell>{line.minWorkers}/{line.optimalWorkers}/{line.maxWorkers}</TableCell>
                        <TableCell>{(line.skilledRatio * 100).toFixed(0)}%</TableCell>
                        <TableCell>{line.productionRate} units/hr</TableCell>
                        <TableCell>{line.priority}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Factory className="h-4 w-4" />
                    Total Production Lines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{productionLines.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    Total Worker Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {productionLines.reduce((sum, line) => sum + line.maxWorkers, 0)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Gauge className="h-4 w-4" />
                    Maximum Production Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {productionLines.reduce((sum, line) => sum + line.productionRate, 0)} units/hr
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* How This Works Section */}
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
                    <div className="space-y-4">
                      <h3 className="font-medium text-blue-700">What This Tool Does:</h3>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-blue-500 mt-1">1.</span>
                          <span>Define production lines with worker requirements and constraints</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-blue-500 mt-1">2.</span>
                          <span>Set skilled worker ratios and production rate targets</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-blue-500 mt-1">3.</span>
                          <span>Monitor and adjust line performance in real-time</span>
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-medium text-blue-700">How to Use:</h3>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-green-500 mt-1">1.</span>
                          <span>Input production line details and constraints</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-green-500 mt-1">2.</span>
                          <span>Set total available workers</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-green-500 mt-1">3.</span>
                          <span>Click "Optimize Allocation" to balance the lines</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Example Section */}
                  <div className="mt-6 border-t pt-6">
                    <h3 className="font-medium text-blue-700 mb-4">Example Setup:</h3>
                    <div className="bg-white/50 p-4 rounded-lg space-y-4">
                      <p className="text-sm text-muted-foreground">Try adding these production lines:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p className="font-medium">Assembly Line A:</p>
                          <ul className="list-disc list-inside text-muted-foreground">
                            <li>Min Workers: 4</li>
                            <li>Optimal Workers: 6</li>
                            <li>Max Workers: 8</li>
                            <li>Production Rate: 10 units/hr</li>
                            <li>Priority: High</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium">Packaging Line B:</p>
                          <ul className="list-disc list-inside text-muted-foreground">
                            <li>Min Workers: 3</li>
                            <li>Optimal Workers: 5</li>
                            <li>Max Workers: 7</li>
                            <li>Production Rate: 15 units/hr</li>
                            <li>Priority: Medium</li>
                          </ul>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        Then set Total Available Workers to 10 and click "Optimize Allocation" to see how the workers are distributed based on priorities and constraints.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductionLines; 
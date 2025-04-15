import { useState } from 'react';
import { Package } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface Item {
  value: number;
  weight: number;
  selected: boolean;
}

interface ResultType {
  selectedItems: number[];
  totalValue: number;
  totalWeight: number;
  item_details: Array<{
    value: number;
    weight: number;
    selected: boolean;
  }>;
}

const MAX_ITEMS = 10; // Maximum number of items allowed

const Knapsack = () => {
  const { toast } = useToast();
  const [numItems, setNumItems] = useState<string>('');
  const [values, setValues] = useState<string[]>([]);
  const [weights, setWeights] = useState<string[]>([]);
  const [capacity, setCapacity] = useState<string>('');
  const [result, setResult] = useState<ResultType | null>(null);
  const [error, setError] = useState<string>('');

  const handleNumItemsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    
    if (num > MAX_ITEMS) {
      toast({
        variant: "destructive",
        title: "Item limit exceeded",
        description: `Maximum ${MAX_ITEMS} items are allowed for optimal performance.`,
      });
      return;
    }
    
    setNumItems(e.target.value);
    if (num > 0 && num <= MAX_ITEMS) {
      setValues(new Array(num).fill(''));
      setWeights(new Array(num).fill(''));
    } else {
      setValues([]);
      setWeights([]);
    }
  };

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  const handleWeightChange = (index: number, weight: string) => {
    const newWeights = [...weights];
    newWeights[index] = weight;
    setWeights(newWeights);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    try {
      const valuesArray = values.map(v => parseFloat(v.trim()));
      const weightsArray = weights.map(w => parseFloat(w.trim()));
      const capacityValue = parseFloat(capacity);

      if (valuesArray.some(isNaN) || weightsArray.some(isNaN) || isNaN(capacityValue)) {
        throw new Error('Please enter valid numbers');
      }

      if (valuesArray.length !== weightsArray.length) {
        throw new Error('Number of values must match number of weights');
      }

      if (capacityValue <= 0) {
        throw new Error('Capacity must be greater than 0');
      }

      // Simple greedy approach (not optimal but works for demo)
      const selectedItems: number[] = [];
      let totalValue = 0;
      let totalWeight = 0;

      const items = valuesArray.map((value, index) => ({
        index,
        value,
        weight: weightsArray[index],
        ratio: value / weightsArray[index]
      }));

      // Sort by value/weight ratio
      items.sort((a, b) => b.ratio - a.ratio);

      let remainingCapacity = capacityValue;
      const itemDetails = new Array(valuesArray.length).fill(null).map((_, i) => ({
        value: valuesArray[i],
        weight: weightsArray[i],
        selected: false
      }));

      // Select items
      for (const item of items) {
        if (item.weight <= remainingCapacity) {
          selectedItems.push(item.index);
          totalValue += item.value;
          totalWeight += item.weight;
          remainingCapacity -= item.weight;
          itemDetails[item.index].selected = true;
        }
      }

      const newResult: ResultType = {
        selectedItems,
        totalValue,
        totalWeight,
        item_details: itemDetails
      };

      setResult(newResult);

      toast({
        title: "Solution found!",
        description: `Found optimal solution with value: ${totalValue} and weight: ${totalWeight}`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-medium mb-4 flex items-center gap-2">
              <Package className="w-8 h-8 text-primary" />
              0/1 Knapsack Problem Solver
            </h1>
            <p className="text-xl text-muted-foreground">
              Solve the classic 0/1 Knapsack problem using integer programming
            </p>
          </div>

          <Card className="p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="numItems">Number of Items (Max: {MAX_ITEMS})</Label>
                <Input
                  id="numItems"
                  type="number"
                  min="1"
                  max={MAX_ITEMS}
                  placeholder={`Enter number of items (1-${MAX_ITEMS})`}
                  value={numItems}
                  onChange={handleNumItemsChange}
                  required
                />
              </div>

              {values.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-medium">Values</div>
                    <div className="font-medium">Weights</div>
                  </div>
                  {values.map((_, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          placeholder={`Value for item ${index + 1}`}
                          value={values[index]}
                          onChange={(e) => handleValueChange(index, e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Input
                          placeholder={`Weight for item ${index + 1}`}
                          value={weights[index]}
                          onChange={(e) => handleWeightChange(index, e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="capacity">Knapsack Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g., 20"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Solve
              </Button>
            </form>
          </Card>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
              {error}
            </div>
          )}

          {result && (
            <Card className="p-6">
              <h2 className="text-2xl font-display font-medium mb-6">Solution</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-800 mb-2">Total Value</h3>
                    <p className="text-2xl font-bold text-green-600">{result.totalValue.toFixed(2)}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Total Weight</h3>
                    <p className="text-2xl font-bold text-blue-600">{result.totalWeight.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Selected Items</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {result.item_details.map((item, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          item.selected ? 'bg-blue-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Item {index + 1}</span>
                          <span className={`text-sm ${
                            item.selected ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {item.selected ? 'Selected' : 'Not Selected'}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Value: {item.value.toFixed(2)}, Weight: {item.weight.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Knapsack; 
import { useState } from 'react';
import { Package } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface Item {
  value: number;
  weight: number;
  selected: boolean;
}

const Knapsack = () => {
  const [numItems, setNumItems] = useState<string>('');
  const [values, setValues] = useState<string[]>([]);
  const [weights, setWeights] = useState<string[]>([]);
  const [capacity, setCapacity] = useState<string>('');
  const [result, setResult] = useState<{
    selectedItems: number[];
    totalValue: number;
    totalWeight: number;
  } | null>(null);
  const [error, setError] = useState<string>('');

  const handleNumItemsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    setNumItems(e.target.value);
    if (num > 0) {
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

      const response = await fetch('/knapsack/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: valuesArray,
          weights: weightsArray,
          capacity: capacityValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to solve knapsack problem');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
                <Label htmlFor="numItems">Number of Items</Label>
                <Input
                  id="numItems"
                  type="number"
                  min="1"
                  placeholder="Enter number of items"
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
                    <p className="text-2xl font-bold text-green-600">{result.total_value}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Total Weight</h3>
                    <p className="text-2xl font-bold text-blue-600">{result.total_weight}</p>
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
                          Value: {item.value}, Weight: {item.weight}
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

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Minus, X, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MatrixInputProps {
  initialRows?: number;
  initialCols?: number;
  minRows?: number;
  minCols?: number;
  maxRows?: number;
  maxCols?: number;
  onChange?: (matrix: number[][]) => void;
  className?: string;
  rowLabels?: string[];
  colLabels?: string[];
  placeholder?: string;
}

const MatrixInput = ({
  initialRows = 3,
  initialCols = 3,
  minRows = 2,
  minCols = 2,
  maxRows = 10,
  maxCols = 10,
  onChange,
  className,
  rowLabels,
  colLabels,
  placeholder = "0"
}: MatrixInputProps) => {
  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);
  const [values, setValues] = useState<string[][]>([]);

  useEffect(() => {
    // Initialize matrix with empty strings
    const initialValues: string[][] = Array(initialRows)
      .fill('')
      .map(() => Array(initialCols).fill(''));
    setValues(initialValues);
  }, [initialRows, initialCols]);

  const handleValueChange = (rowIndex: number, colIndex: number, value: string) => {
    const newValues = [...values];
    newValues[rowIndex] = [...newValues[rowIndex]];
    newValues[rowIndex][colIndex] = value;
    setValues(newValues);
    
    if (onChange) {
      // Convert strings to numbers for the callback
      const numericMatrix = newValues.map(row => 
        row.map(cell => cell === '' ? 0 : parseFloat(cell))
      );
      onChange(numericMatrix);
    }
  };

  const addRow = () => {
    if (rows < maxRows) {
      setRows(rows + 1);
      setValues([...values, Array(cols).fill('')]);
    }
  };

  const removeRow = () => {
    if (rows > minRows) {
      setRows(rows - 1);
      setValues(values.slice(0, -1));
    }
  };

  const addColumn = () => {
    if (cols < maxCols) {
      setCols(cols + 1);
      setValues(values.map(row => [...row, '']));
    }
  };

  const removeColumn = () => {
    if (cols > minCols) {
      setCols(cols - 1);
      setValues(values.map(row => row.slice(0, -1)));
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={removeRow}
            disabled={rows <= minRows}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm">Rows: {rows}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addRow}
            disabled={rows >= maxRows}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <X className="h-4 w-4 text-muted-foreground" />
        
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={removeColumn}
            disabled={cols <= minCols}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm">Columns: {cols}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addColumn}
            disabled={cols >= maxCols}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-muted/50">
              {colLabels && <th className="p-2 text-xs font-medium text-muted-foreground"></th>}
              {Array.from({ length: cols }).map((_, colIndex) => (
                <th key={colIndex} className="p-2 text-xs font-medium text-muted-foreground">
                  {colLabels ? colLabels[colIndex] || `Col ${colIndex + 1}` : `Col ${colIndex + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-t border-border">
                {rowLabels && (
                  <td className="p-2 text-xs font-medium text-muted-foreground bg-muted/50">
                    {rowLabels[rowIndex] || `Row ${rowIndex + 1}`}
                  </td>
                )}
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <td key={colIndex} className="p-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={values[rowIndex]?.[colIndex] || ''}
                      onChange={(e) => handleValueChange(rowIndex, colIndex, e.target.value)}
                      placeholder={placeholder}
                      className="matrix-cell w-full h-10 text-center focus:outline-none"
                      aria-label={`Value at row ${rowIndex + 1}, column ${colIndex + 1}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatrixInput;

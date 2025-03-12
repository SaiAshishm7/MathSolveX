
import { useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}

interface Line {
  points: Point[];
  color: string;
  dashed?: boolean;
}

interface Region {
  points: Point[];
  color: string;
}

interface GraphCanvasProps {
  width?: number;
  height?: number;
  lines?: Line[];
  regions?: Region[];
  points?: { point: Point; label?: string; color?: string }[];
  xRange?: [number, number]; // [min, max]
  yRange?: [number, number]; // [min, max]
  gridSize?: number;
  className?: string;
}

const GraphCanvas = ({
  width = 600,
  height = 400,
  lines = [],
  regions = [],
  points = [],
  xRange = [-10, 10],
  yRange = [-10, 10],
  gridSize = 1,
  className,
}: GraphCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const xMin = xRange[0];
    const xMax = xRange[1];
    const yMin = yRange[0];
    const yMax = yRange[1];
    
    const xStep = width / (xMax - xMin);
    const yStep = height / (yMax - yMin);
    
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 0.5;
    
    // Draw vertical grid lines
    for (let x = xMin; x <= xMax; x += gridSize) {
      const xPos = (x - xMin) * xStep;
      ctx.beginPath();
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, height);
      ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let y = yMin; y <= yMax; y += gridSize) {
      const yPos = height - (y - yMin) * yStep;
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(width, yPos);
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1.5;
    
    // x-axis
    const yAxisPos = height - (-yMin * yStep);
    ctx.beginPath();
    ctx.moveTo(0, yAxisPos);
    ctx.lineTo(width, yAxisPos);
    ctx.stroke();
    
    // y-axis
    const xAxisPos = -xMin * xStep;
    ctx.beginPath();
    ctx.moveTo(xAxisPos, 0);
    ctx.lineTo(xAxisPos, height);
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#111827';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // x-axis labels
    for (let x = xMin; x <= xMax; x += gridSize) {
      if (x === 0) continue;
      const xPos = (x - xMin) * xStep;
      ctx.fillText(x.toString(), xPos, yAxisPos + 5);
    }
    
    // y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = yMin; y <= yMax; y += gridSize) {
      if (y === 0) continue;
      const yPos = height - (y - yMin) * yStep;
      ctx.fillText(y.toString(), xAxisPos - 5, yPos);
    }
    
    // Origin label
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText("0", xAxisPos - 5, yAxisPos + 5);
  };

  const mapToCanvas = (point: Point): Point => {
    const { x, y } = point;
    const xMin = xRange[0];
    const yMin = yRange[0];
    const xStep = width / (xRange[1] - xRange[0]);
    const yStep = height / (yRange[1] - yRange[0]);
    
    return {
      x: (x - xMin) * xStep,
      y: height - (y - yMin) * yStep,
    };
  };

  const drawRegions = (ctx: CanvasRenderingContext2D) => {
    regions.forEach(region => {
      if (region.points.length < 3) return;
      
      ctx.fillStyle = region.color;
      ctx.beginPath();
      
      const mappedPoints = region.points.map(mapToCanvas);
      ctx.moveTo(mappedPoints[0].x, mappedPoints[0].y);
      
      for (let i = 1; i < mappedPoints.length; i++) {
        ctx.lineTo(mappedPoints[i].x, mappedPoints[i].y);
      }
      
      ctx.closePath();
      ctx.fill();
    });
  };

  const drawLines = (ctx: CanvasRenderingContext2D) => {
    lines.forEach(line => {
      const { points, color, dashed } = line;
      if (points.length < 2) return;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      
      if (dashed) {
        ctx.setLineDash([5, 3]);
      } else {
        ctx.setLineDash([]);
      }
      
      ctx.beginPath();
      
      const mappedPoints = points.map(mapToCanvas);
      ctx.moveTo(mappedPoints[0].x, mappedPoints[0].y);
      
      for (let i = 1; i < mappedPoints.length; i++) {
        ctx.lineTo(mappedPoints[i].x, mappedPoints[i].y);
      }
      
      ctx.stroke();
    });
    
    ctx.setLineDash([]);
  };

  const drawPoints = (ctx: CanvasRenderingContext2D) => {
    points.forEach(({ point, label, color = '#3B82F6' }) => {
      const mappedPoint = mapToCanvas(point);
      
      // Draw point
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(mappedPoint.x, mappedPoint.y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw label if provided
      if (label) {
        ctx.fillStyle = '#111827';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(label, mappedPoint.x, mappedPoint.y - 8);
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw components
    drawGrid(ctx);
    drawRegions(ctx);
    drawLines(ctx);
    drawPoints(ctx);
  }, [width, height, lines, regions, points, xRange, yRange, gridSize]);

  return (
    <div className={cn("graph-canvas p-4", className)}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="max-w-full h-auto"
      />
    </div>
  );
};

export default GraphCanvas;

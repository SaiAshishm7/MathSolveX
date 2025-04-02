import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import GraphicalMethod from "./pages/GraphicalMethod";
import SimplexMethod from "./pages/SimplexMethod";
import Transportation from "./pages/Transportation";
import WorkforceOptimization from "./pages/WorkforceOptimization";
import WorkforceShiftScheduler from "./pages/WorkforceShiftScheduler";
import ProductionLines from './pages/ProductionLines';
import Knapsack from './pages/knapsack';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/graphical-method" element={<GraphicalMethod />} />
          <Route path="/simplex-method" element={<SimplexMethod />} />
          <Route path="/transportation" element={<Transportation />} />
          <Route path="/workforce-optimization" element={<WorkforceOptimization />} />
          <Route path="/workforce-shift-scheduler" element={<WorkforceShiftScheduler />} />
          <Route path="/production-lines" element={<ProductionLines />} />
          <Route path="/knapsack" element={<Knapsack />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

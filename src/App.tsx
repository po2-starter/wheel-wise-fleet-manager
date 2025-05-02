
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VehiclesPage from "./pages/Vehicles";
import RentalsPage from "./pages/Rentals";
import MaintenancePage from "./pages/Maintenance";
import ExpenditurePage from "./pages/Expenditure";
import ReportsPage from "./pages/Reports";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <AuthGuard>
              <Index />
            </AuthGuard>
          } />
          <Route path="/vehicles" element={
            <AuthGuard>
              <VehiclesPage />
            </AuthGuard>
          } />
          <Route path="/rentals" element={
            <AuthGuard>
              <RentalsPage />
            </AuthGuard>
          } />
          <Route path="/maintenance" element={
            <AuthGuard>
              <MaintenancePage />
            </AuthGuard>
          } />
          <Route path="/expenditure" element={
            <AuthGuard>
              <ExpenditurePage />
            </AuthGuard>
          } />
          <Route path="/reports" element={
            <AuthGuard>
              <ReportsPage />
            </AuthGuard>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

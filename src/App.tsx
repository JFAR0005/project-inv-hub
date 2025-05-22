
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Portfolio from "./pages/Portfolio";
import Notes from "./pages/Notes";
import Deals from "./pages/Deals";
import Meetings from "./pages/Meetings";
import NotFound from "./pages/NotFound";
import CompanyDetails from "./pages/CompanyDetails";
import CompanyProfile from "./pages/CompanyProfile";
import Dealflow from "./pages/Dealflow";
import SubmitUpdate from "./pages/SubmitUpdate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Index />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/dealflow" element={<Dealflow />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/companies/:id" element={<CompanyProfile />} />
            <Route path="/submit-update" element={<SubmitUpdate />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

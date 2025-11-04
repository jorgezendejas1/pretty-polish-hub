import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Chatbot } from "@/components/Chatbot";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import BeforeAfter from "./pages/BeforeAfter";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Diplomas from "./pages/Diplomas";
import ImageEditor from "./pages/ImageEditor";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/servicios" element={<Services />} />
            <Route path="/portafolio" element={<Portfolio />} />
            <Route path="/transformaciones" element={<BeforeAfter />} />
            <Route path="/equipo" element={<Team />} />
            <Route path="/sobre-nosotros" element={<About />} />
            <Route path="/certificaciones" element={<Diplomas />} />
            <Route path="/editor" element={<ImageEditor />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Chatbot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

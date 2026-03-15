import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Public pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Plans from "./pages/Plans";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// App pages (mobile-first dashboard)
import Home from "./pages/Home";
import Invest from "./pages/Invest";
import Team from "./pages/Team";
import WalletPage from "./pages/WalletPage";
import Profile from "./pages/Profile";
import AppDeposit from "./pages/AppDeposit";
import AppWithdraw from "./pages/AppWithdraw";
import WFP from "./pages/WFP";
import Certificate from "./pages/Certificate";
import TermsConditions from "./pages/TermsConditions";
import Event from "./pages/Event";
import AML from "./pages/AML";

// Admin
import AdminPanel from "./pages/AdminPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* App (authenticated) */}
          <Route path="/app" element={<Home />} />
          <Route path="/app/invest" element={<Invest />} />
          <Route path="/app/team" element={<Team />} />
          <Route path="/app/wallet" element={<WalletPage />} />
          <Route path="/app/wallet/deposit" element={<AppDeposit />} />
          <Route path="/app/wallet/withdraw" element={<AppWithdraw />} />
          <Route path="/app/profile" element={<Profile />} />
          <Route path="/app/wfp" element={<WFP />} />
          <Route path="/app/certificate" element={<Certificate />} />
          <Route path="/app/terms" element={<TermsConditions />} />
          <Route path="/app/event" element={<Event />} />
          <Route path="/app/aml" element={<AML />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminPanel />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

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
import ResetPassword from "./pages/ResetPassword";

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
        <AuthProvider>
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
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* App (authenticated) */}
            <Route path="/app" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/app/invest" element={<ProtectedRoute><Invest /></ProtectedRoute>} />
            <Route path="/app/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="/app/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/app/wallet/deposit" element={<ProtectedRoute><AppDeposit /></ProtectedRoute>} />
            <Route path="/app/wallet/withdraw" element={<ProtectedRoute><AppWithdraw /></ProtectedRoute>} />
            <Route path="/app/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/app/wfp" element={<ProtectedRoute><WFP /></ProtectedRoute>} />
            <Route path="/app/certificate" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
            <Route path="/app/terms" element={<ProtectedRoute><TermsConditions /></ProtectedRoute>} />
            <Route path="/app/event" element={<ProtectedRoute><Event /></ProtectedRoute>} />
            <Route path="/app/aml" element={<ProtectedRoute><AML /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

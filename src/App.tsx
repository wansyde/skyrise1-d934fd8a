import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";

// Public pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";

import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";

// App pages (mobile-first dashboard)
import Home from "./pages/Home";

import Starting from "./pages/Starting";
import Team from "./pages/Team";
import Records from "./pages/Records";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import AppDeposit from "./pages/AppDeposit";
import AppWithdraw from "./pages/AppWithdraw";
import WFP from "./pages/WFP";
import Certificate from "./pages/Certificate";
import TermsConditions from "./pages/TermsConditions";
import Event from "./pages/Event";
import AML from "./pages/AML";
import PersonalInfo from "./pages/PersonalInfo";
import KYC from "./pages/KYC";
import WalletPage from "./pages/WalletPage";
import PaymentMethods from "./pages/PaymentMethods";
import Notifications from "./pages/Notifications";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import SupportChat from "./pages/SupportChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* App (authenticated) */}
            <Route path="/app" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            
            <Route path="/app/starting" element={<ProtectedRoute><Starting /></ProtectedRoute>} />
            <Route path="/app/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="/app/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
            <Route path="/app/wallet/deposit" element={<ProtectedRoute><AppDeposit /></ProtectedRoute>} />
            <Route path="/app/wallet/withdraw" element={<ProtectedRoute><AppWithdraw /></ProtectedRoute>} />
            <Route path="/app/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/app/wfp" element={<ProtectedRoute><WFP /></ProtectedRoute>} />
            <Route path="/app/certificate" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
            <Route path="/app/terms" element={<ProtectedRoute><TermsConditions /></ProtectedRoute>} />
            <Route path="/app/event" element={<ProtectedRoute><Event /></ProtectedRoute>} />
            <Route path="/app/aml" element={<ProtectedRoute><AML /></ProtectedRoute>} />
            <Route path="/app/settings" element={<ProtectedRoute><PersonalInfo /></ProtectedRoute>} />
            <Route path="/app/kyc" element={<ProtectedRoute><KYC /></ProtectedRoute>} />
            {/* Wallet page removed — deposit/withdraw accessed directly */}
            <Route path="/app/wallet/payment-methods" element={<ProtectedRoute><PaymentMethods /></ProtectedRoute>} />
            <Route path="/app/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/app/support" element={<ProtectedRoute><SupportChat /></ProtectedRoute>} />
            <Route path="/app/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin-sky-987" element={<AdminLogin />} />
            <Route path="/admin-sky-987/dashboard" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

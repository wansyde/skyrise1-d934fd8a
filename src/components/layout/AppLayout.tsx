import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, TrendingUp, Users, Wallet, User,
  Menu, X, ChevronRight, FileText, Award,
  ArrowUpFromLine, ArrowDownToLine, Scale,
  Calendar, HelpCircle, Info, Shield
} from "lucide-react";

const bottomTabs = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/invest", label: "Invest", icon: TrendingUp },
  { href: "/app/team", label: "Team", icon: Users },
  { href: "/app/wallet", label: "Wallet", icon: Wallet },
  { href: "/app/profile", label: "Profile", icon: User },
];

const slideMenuItems = [
  { href: "/app/wfp", label: "WFP", icon: FileText },
  { href: "/app/certificate", label: "Certificate", icon: Award },
  { href: "/app/wallet/withdraw", label: "Withdrawal", icon: ArrowUpFromLine },
  { href: "/app/wallet/deposit", label: "Deposit", icon: ArrowDownToLine },
  { href: "/app/terms", label: "T & C", icon: Scale },
  { href: "/app/event", label: "Event", icon: Calendar },
  { href: "/faq", label: "FAQs", icon: HelpCircle },
  { href: "/about", label: "About", icon: Info },
  { href: "/app/aml", label: "AML", icon: Shield },
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 border-b border-border bg-background/90 backdrop-blur-xl">
        <button
          onClick={() => setMenuOpen(true)}
          className="flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Sky<span className="text-primary">rise</span>
        </Link>
        <div className="w-9" />
      </header>

      {/* Slide-out menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm flex flex-col"
              style={{ background: "var(--gradient-hero)" }}
            >
              {/* Menu header */}
              <div className="flex h-14 items-center justify-between px-5">
                <Link to="/" className="text-lg font-semibold tracking-tight" onClick={() => setMenuOpen(false)}>
                  Sky<span className="text-primary">rise</span>
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Menu items */}
              <nav className="flex-1 overflow-y-auto px-5 pt-4">
                {slideMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="slide-menu-item"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content - scrollable area above bottom nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bottom-nav safe-bottom">
        <div className="flex items-center justify-around h-16">
          {bottomTabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className={`bottom-nav-item ${active ? "active" : ""}`}
              >
                <tab.icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
                <span>{tab.label}</span>
                <span
                  className={`nav-dot h-1 w-1 rounded-full bg-primary transition-all duration-200 ${active ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;

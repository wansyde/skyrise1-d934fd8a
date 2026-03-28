import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ArrowDownToLine, ArrowUpFromLine,
  Clock, Settings, LogOut, Menu, X, ChevronRight, PanelLeftClose, PanelLeft
} from "lucide-react";
import SkyriseLogo from "@/components/SkyriseLogo";

const navItems = [
  { href: "/admin-sky-987/dashboard", label: "Overview", icon: LayoutDashboard },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const SidebarContent = ({ showClose }: { showClose?: boolean }) => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center">
          <SkyriseLogo className="h-14 w-auto" />
        </Link>
        {showClose && (
          <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground lg:hidden">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        )}
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`nav-pill flex items-center gap-3 ${isActive ? "active" : ""}`}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.5} />
              {item.label}
              {isActive && <ChevronRight className="ml-auto h-3 w-3 text-primary" strokeWidth={1.5} />}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3 space-y-1">
        <button
          onClick={() => setSidebarCollapsed(true)}
          className="nav-pill flex items-center gap-3 w-full text-muted-foreground hover:text-foreground hidden lg:flex"
        >
          <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
          Collapse
        </button>
        <Link to="/login" className="nav-pill flex items-center gap-3 text-destructive hover:text-destructive">
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Sign Out
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <AnimatePresence initial={false}>
        {!sidebarCollapsed && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden shrink-0 border-r border-border glass-sidebar lg:block overflow-hidden"
          >
            <div className="sticky top-0 h-screen w-[260px]">
              <SidebarContent />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-border bg-card lg:hidden"
            >
              <SidebarContent showClose />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b border-border px-6">
          {/* Mobile menu button */}
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground lg:hidden">
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          {/* Desktop expand button (when collapsed) */}
          {sidebarCollapsed && (
            <button onClick={() => setSidebarCollapsed(false)} className="text-muted-foreground hover:text-foreground hidden lg:flex">
              <PanelLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
          )}
          <span className="flex items-center lg:hidden">
            <SkyriseLogo className="h-14 w-auto" />
          </span>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

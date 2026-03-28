import { Link, useLocation } from "react-router-dom";
import { ReactNode, useState } from "react";
import { Menu, X, ChevronRight, FileText, Award, ArrowUpFromLine, ArrowDownToLine, Scale, Calendar, HelpCircle, Info, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import SkyriseLogo from "@/components/SkyriseLogo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const slideMenuItems = [
  { href: "https://www.wfp.org", label: "WFP", icon: FileText, external: true },
  { href: "/about", label: "About", icon: Info },
  { href: "/faq", label: "FAQs", icon: HelpCircle },
  { href: "/contact", label: "Contact", icon: Scale },
];

const PublicLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [slideMenuOpen, setSlideMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSlideMenuOpen(true)}
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>

          <Link to="/" className="flex items-center">
            <SkyriseLogo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`nav-pill ${location.pathname === link.href ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button asChild variant="ghost" size="sm" className="btn-press">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="btn-press">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile toggle (right side) */}
          <div className="md:hidden w-9" />
        </div>
      </header>

      {/* Slide-out menu for mobile */}
      <AnimatePresence>
        {slideMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSlideMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-[70] w-[85%] max-w-sm flex flex-col bg-background border-r border-border"
            >
              <div className="flex h-14 items-center justify-between px-5">
                <Link to="/" className="flex items-center" onClick={() => setSlideMenuOpen(false)}>
                  <SkyriseLogo className="h-7 w-auto" />
                </Link>
                <button
                  onClick={() => setSlideMenuOpen(false)}
                  className="flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-5 pt-4">
                {slideMenuItems.map((item) =>
                  item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setSlideMenuOpen(false)}
                      className="flex items-center justify-between py-3 px-3 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSlideMenuOpen(false)}
                      className="flex items-center justify-between py-3 px-3 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    </Link>
                  )
                )}

                <div className="mt-6 flex flex-col gap-2">
                  <Button asChild variant="outline" size="sm" className="btn-press">
                    <Link to="/login" onClick={() => setSlideMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button asChild size="sm" className="btn-press">
                    <Link to="/register" onClick={() => setSlideMenuOpen(false)}>Get Started</Link>
                  </Button>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 pt-16">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Skyrise. All rights reserved.
            </div>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Security"].map((item) => (
                <span key={item} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;

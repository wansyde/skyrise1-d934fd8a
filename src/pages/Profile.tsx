import AppLayout from "@/components/layout/AppLayout";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, CreditCard, MessageSquare, Bell, LogOut,
  ChevronRight, Shield, ArrowDownToLine, ArrowUpFromLine,
  ArrowLeftRight, IdCard, UserCircle, Wallet
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const financialItems = [
  { label: "Deposit", icon: ArrowDownToLine, href: "/app/wallet/deposit" },
  { label: "Withdraw", icon: ArrowUpFromLine, href: "/app/wallet/withdraw" },
  { label: "Transaction", icon: ArrowLeftRight, href: "/app/records" },
];

const detailItems = [
  { label: "KYC", icon: IdCard, href: "/app/profile" },
  { label: "Personal Information", icon: UserCircle, href: "/app/profile" },
  { label: "Payment Methods", icon: Wallet, href: "/app/wallet" },
];

const otherItems = [
  { label: "Contact Us", icon: MessageSquare, href: "/contact" },
  { label: "Notifications", icon: Bell, href: "/app/profile" },
];

const Profile = () => {
  const { profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const balance = profile?.balance ?? 0;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const MenuGroup = ({ title, items }: { title: string; items: typeof financialItems }) => (
    <div className="mb-5">
      <h3 className="text-sm font-semibold mb-2 px-1">{title}</h3>
      <div className="rounded-2xl overflow-hidden border border-border bg-card">
        {items.map((item, i) => (
          <Link
            key={item.label}
            to={item.href}
            className={`flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-muted/30 ${i > 0 ? "border-t border-border" : ""}`}
          >
            <item.icon className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.5} />
            <span className="flex-1 text-sm">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="px-4 py-5">
        {/* Hero banner area */}
        <div className="relative mb-5 rounded-2xl overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-card via-card to-muted" />

          {/* Avatar + user info overlapping */}
          <div className="relative -mt-10 px-4 pb-4">
            <div className="flex items-end gap-3">
              <div className="h-16 w-16 rounded-full border-[3px] border-card bg-muted flex items-center justify-center shrink-0">
                <User className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div className="pb-1">
                <h1 className="text-base font-semibold leading-tight">{profile?.username || profile?.full_name || "User"}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Invitation Code: {profile?.referral_code || "—"}
                </p>
              </div>
            </div>

            {/* Credit Score */}
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Credit Score:</span>
              <span className="font-medium">100%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="balance-card p-4 rounded-xl">
            <span className="text-xs text-white/50">Wallet Amount</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-semibold tabular-nums">
                {balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-white/40 font-medium">AC</span>
            </div>
          </div>
          <div className="balance-card p-4 rounded-xl">
            <span className="text-xs text-white/50">Advertising Salary</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-semibold tabular-nums">0</span>
              <span className="text-[10px] text-white/40 font-medium">AC</span>
            </div>
          </div>
        </div>

        {/* Admin link */}
        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5 mb-5 transition-colors hover:bg-primary/10"
          >
            <Shield className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
            <span className="flex-1 text-sm font-medium text-primary">Admin Panel</span>
            <ChevronRight className="h-4 w-4 text-primary/50" strokeWidth={1.5} />
          </Link>
        )}

        {/* Menu sections */}
        <MenuGroup title="My Financial" items={financialItems} />
        <MenuGroup title="My Detail" items={detailItems} />
        <MenuGroup title="Other" items={otherItems} />

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full h-12 mt-2 mb-4"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} />
          Logout
        </Button>

        <p className="text-center text-xs text-muted-foreground pb-4">©1999–2026 Skyrise</p>
      </div>
    </AppLayout>
  );
};

export default Profile;

import AppLayout from "@/components/layout/AppLayout";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, CreditCard, MessageSquare, Bell, LogOut,
  ChevronRight, Shield, ArrowDownToLine, ArrowUpFromLine,
  IdCard, UserCircle, Wallet, BadgeCheck, DollarSign
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import heroCarBanner from "@/assets/hero-car-banner.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWhatsAppNumber } from "@/hooks/useWhatsAppNumber";

const financialItems = [
  { label: "Deposit", icon: ArrowDownToLine, href: "/app/wallet/deposit" },
  { label: "Withdraw", icon: ArrowUpFromLine, href: "/app/wallet/withdraw" },
  { label: "Transactions", icon: DollarSign, href: "/app/transactions" },
];

const detailItems = [
  { label: "KYC", icon: IdCard, href: "/app/kyc" },
  { label: "Personal Information", icon: UserCircle, href: "/app/settings" },
  { label: "Payment Methods", icon: Wallet, href: "/app/wallet/payment-methods" },
];

const otherItems = [
  { label: "Contact Us", icon: MessageSquare, href: "/contact" },
  { label: "Notifications", icon: Bell, href: "/app/notifications" },
];

const Profile = () => {
  const { profile, signOut, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const balance = profile?.balance ?? 0;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { data: pendingCount } = useQuery({
    queryKey: ["notif-badge", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ count: dc }, { count: wc }] = await Promise.all([
        supabase.from("deposits").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("status", "pending"),
        supabase.from("withdrawals").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("status", "pending"),
      ]);
      return (dc || 0) + (wc || 0);
    },
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const { url: whatsappUrl } = useWhatsAppNumber();

  const MenuGroup = ({ title, items }: { title: string; items: typeof financialItems }) => (
    <div className="mb-5">
      <h3 className="text-sm font-semibold mb-2 px-1">{title}</h3>
      <div className="rounded-2xl overflow-hidden border border-border bg-card">
        {items.map((item, i) => {
          const isContact = item.label === "Contact Us";
          const cls = `flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-muted/30 ${i > 0 ? "border-t border-border" : ""}`;
          const content = (
            <>
              <item.icon className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.5} />
              <span className="flex-1 text-sm">{item.label}</span>
              {item.label === "Notifications" && pendingCount && pendingCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-1.5">
                  {pendingCount}
                </span>
              ) : null}
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
            </>
          );

          if (isContact && whatsappUrl) {
            return (
              <a key={item.label} href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={cls}>
                {content}
              </a>
            );
          }

          return (
            <Link key={item.label} to={item.href} className={cls}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="px-4 py-5">
        {/* Hero banner area */}
        <div className="relative mb-5 rounded-2xl overflow-hidden bg-card border border-border">
          <div className="relative h-36 w-full overflow-hidden">
            <img src={heroCarBanner} alt="Profile banner" className="absolute inset-0 h-full w-full object-cover object-center" width={1920} height={768} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/30" />
          </div>

          {/* Avatar + user info below banner */}
          <div className="relative px-4 pb-4">
            <div className="flex items-end gap-3 -mt-9">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="rounded-full border-[3px] border-card object-cover shrink-0 shadow-lg" style={{ width: 68, height: 68 }} />
              ) : (
                <div className="rounded-full border-[3px] border-card bg-muted flex items-center justify-center shrink-0 shadow-lg" style={{ width: 68, height: 68 }}>
                  <User className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
                </div>
              )}
            </div>
            <div className="mt-2.5 px-0.5">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-semibold leading-tight text-foreground">{profile?.username || profile?.full_name || "User"}</h1>
                <BadgeCheck className="h-4 w-4 text-primary fill-primary/15" strokeWidth={2} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Invitation Code: {profile?.referral_code || "—"}
              </p>
            </div>

            {/* Credit Score */}
            {(() => {
              const score = (profile as any)?.credit_score ?? 100;
              return (
                <>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Credit Score:</span>
                    <span className="font-medium">{score}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${score}%`,
                        backgroundColor: score >= 80 ? 'hsl(var(--primary))' : score >= 50 ? 'hsl(45 93% 47%)' : 'hsl(var(--destructive))',
                      }}
                    />
                  </div>
                </>
              );
            })()}
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
               <span className="text-[10px] text-white/40 font-medium">USDC</span>
            </div>
          </div>
          <div className="balance-card p-4 rounded-xl">
            <span className="text-xs text-white/50">Advertising Salary</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-semibold tabular-nums">
                {Number(profile?.advertising_salary ?? 0).toFixed(2)}
              </span>
              <span className="text-[10px] text-white/40 font-medium">USDC</span>
            </div>
          </div>
        </div>

        {/* Admin link */}
        {isAdmin && (
          <Link
            to="/admin-sky-987/dashboard"
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
          onClick={() => setShowLogoutConfirm(true)}
        >
          <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} />
          Logout
        </Button>

        {/* Logout Confirmation */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
              onClick={() => setShowLogoutConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-card rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <LogOut className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-base font-semibold mb-1">Are you sure you want to log out?</h3>
                <p className="text-xs text-muted-foreground mb-5">You'll need to sign in again to access your account.</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={() => setShowLogoutConfirm(false)}
                  >
                    Stay
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 h-11"
                    onClick={handleSignOut}
                  >
                    Log Out
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-muted-foreground pb-4">©1999–2026 Skyrise</p>
      </div>
    </AppLayout>
  );
};

export default Profile;

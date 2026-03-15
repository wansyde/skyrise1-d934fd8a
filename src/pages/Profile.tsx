import AppLayout from "@/components/layout/AppLayout";
import { Link } from "react-router-dom";
import {
  User, CreditCard, MessageSquare, Bell, LogOut,
  ChevronRight, Shield, Settings
} from "lucide-react";

const profileSections = [
  {
    items: [
      { label: "Personal Information", icon: User, href: "/app/profile/info" },
      { label: "Payment Methods", icon: CreditCard, href: "/app/profile/payments" },
      { label: "Security", icon: Shield, href: "/app/profile/security" },
    ],
  },
  {
    items: [
      { label: "Notifications", icon: Bell, href: "/app/profile/notifications" },
      { label: "Contact Support", icon: MessageSquare, href: "/contact" },
      { label: "Settings", icon: Settings, href: "/app/profile/settings" },
    ],
  },
];

const Profile = () => (
  <AppLayout>
    <div className="px-4 py-5">
      {/* Avatar + name */}
      <div className="flex flex-col items-center mb-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <User className="h-8 w-8 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-lg font-semibold">John Doe</h1>
        <p className="text-sm text-muted-foreground">john@example.com</p>
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Verified
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card p-3 text-center">
          <div className="text-lg font-semibold tabular-nums">$15.2K</div>
          <span className="text-[10px] text-muted-foreground">Balance</span>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-lg font-semibold tabular-nums">$10K</div>
          <span className="text-[10px] text-muted-foreground">Invested</span>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-lg font-semibold tabular-nums">3</div>
          <span className="text-[10px] text-muted-foreground">Referrals</span>
        </div>
      </div>

      {/* Menu sections */}
      {profileSections.map((section, si) => (
        <div key={si} className="glass-card overflow-hidden mb-4">
          {section.items.map((item, ii) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30 ${ii > 0 ? "border-t border-border" : ""}`}
            >
              <item.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            </Link>
          ))}
        </div>
      ))}

      {/* Logout */}
      <Link
        to="/login"
        className="glass-card flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-destructive/5"
      >
        <LogOut className="h-4 w-4 text-destructive" strokeWidth={1.5} />
        <span className="flex-1 text-sm font-medium text-destructive">Sign Out</span>
      </Link>
    </div>
  </AppLayout>
);

export default Profile;

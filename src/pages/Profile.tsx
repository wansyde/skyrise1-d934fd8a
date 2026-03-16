import AppLayout from "@/components/layout/AppLayout";
import { Link, useNavigate } from "react-router-dom";
import {
  User, CreditCard, MessageSquare, Bell, LogOut,
  ChevronRight, Shield, Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const profileSections = [
  {
    items: [
      { label: "Personal Information", icon: User, href: "/app/profile" },
      { label: "Payment Methods", icon: CreditCard, href: "/app/wallet" },
      { label: "Security", icon: Shield, href: "/app/profile" },
    ],
  },
  {
    items: [
      { label: "Notifications", icon: Bell, href: "/app/profile" },
      { label: "Contact Support", icon: MessageSquare, href: "/contact" },
      { label: "Settings", icon: Settings, href: "/app/profile" },
    ],
  },
];

const Profile = () => {
  const { profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <AppLayout>
      <div className="px-4 py-5">
        <div className="flex flex-col items-center mb-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <User className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-lg font-semibold">{profile?.full_name || "User"}</h1>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
          <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${profile?.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${profile?.status === "active" ? "bg-success" : "bg-warning"}`} />
            {profile?.status === "active" ? "Verified" : "Pending"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-card p-3 text-center">
            <div className="text-lg font-semibold tabular-nums">${((profile?.balance ?? 0) / 1000).toFixed(1)}K</div>
            <span className="text-[10px] text-muted-foreground">Balance</span>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-lg font-semibold tabular-nums">—</div>
            <span className="text-[10px] text-muted-foreground">Invested</span>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-lg font-semibold tabular-nums">0</div>
            <span className="text-[10px] text-muted-foreground">Referrals</span>
          </div>
        </div>

        {isAdmin && (
          <Link
            to="/admin"
            className="glass-card flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-primary/5 mb-4"
          >
            <Shield className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <span className="flex-1 text-sm font-medium text-primary">Admin Panel</span>
            <ChevronRight className="h-4 w-4 text-primary" strokeWidth={1.5} />
          </Link>
        )}

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

        <button
          onClick={handleSignOut}
          className="glass-card flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-destructive/5 w-full"
        >
          <LogOut className="h-4 w-4 text-destructive" strokeWidth={1.5} />
          <span className="flex-1 text-left text-sm font-medium text-destructive">Sign Out</span>
        </button>
      </div>
    </AppLayout>
  );
};

export default Profile;

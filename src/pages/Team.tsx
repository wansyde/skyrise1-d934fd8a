import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Copy, Users, UserPlus, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const referralCode = "SKY-JD2026X";
const referralLink = "https://skyrise.com/ref/SKY-JD2026X";

const teamMembers = [
  { name: "Alice M.", joined: "Mar 10, 2026", status: "Active", earned: "$50.00" },
  { name: "Bob K.", joined: "Feb 28, 2026", status: "Active", earned: "$120.00" },
  { name: "Carol S.", joined: "Feb 15, 2026", status: "Inactive", earned: "$30.00" },
];

const Team = () => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard.");
  };

  return (
    <AppLayout>
      <div className="px-4 py-5">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Team & Referrals</h1>
          <p className="mt-1 text-sm text-muted-foreground">Invite others and earn referral bonuses.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="glass-card p-3 text-center">
            <Users className="h-4 w-4 mx-auto text-primary mb-1" strokeWidth={1.5} />
            <div className="text-lg font-semibold">3</div>
            <span className="text-[10px] text-muted-foreground">Team Size</span>
          </div>
          <div className="glass-card p-3 text-center">
            <Gift className="h-4 w-4 mx-auto text-success mb-1" strokeWidth={1.5} />
            <div className="text-lg font-semibold tabular-nums">$200</div>
            <span className="text-[10px] text-muted-foreground">Total Earned</span>
          </div>
          <div className="glass-card p-3 text-center">
            <UserPlus className="h-4 w-4 mx-auto text-warning mb-1" strokeWidth={1.5} />
            <div className="text-lg font-semibold">5%</div>
            <span className="text-[10px] text-muted-foreground">Commission</span>
          </div>
        </div>

        {/* Referral link */}
        <div className="glass-card p-4 mb-5">
          <h3 className="text-sm font-medium mb-3">Your Referral Code</h3>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 mb-3">
            <code className="flex-1 text-sm font-mono text-primary">{referralCode}</code>
            <button onClick={() => handleCopy(referralCode)} className="text-muted-foreground hover:text-primary transition-colors">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <code className="flex-1 text-[11px] font-mono text-muted-foreground truncate">{referralLink}</code>
            <button onClick={() => handleCopy(referralLink)} className="text-muted-foreground hover:text-primary transition-colors shrink-0">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <Button className="btn-press w-full mt-3 gap-2 text-xs" onClick={() => handleCopy(referralLink)}>
            <UserPlus className="h-3.5 w-3.5" /> Share Invite Link
          </Button>
        </div>

        {/* Team list */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-3">Team Members</h3>
          <div className="flex flex-col gap-2">
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="glass-card flex items-center justify-between p-3.5"
              >
                <div>
                  <span className="text-sm font-medium">{member.name}</span>
                  <span className="text-xs text-muted-foreground block mt-0.5">Joined {member.joined}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium tabular-nums text-success">{member.earned}</span>
                  <span className={`text-[10px] block mt-0.5 ${member.status === "Active" ? "text-success" : "text-muted-foreground"}`}>
                    {member.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Team;

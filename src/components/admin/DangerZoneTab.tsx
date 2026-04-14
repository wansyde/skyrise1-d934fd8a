import { useState } from "react";
import { Bomb, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DangerZoneTab = () => {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0); // 0=idle, 1=password, 2=confirm text, 3=processing
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStartReset = () => setStep(1);

  const handlePasswordSubmit = () => {
    if (!password.trim()) { toast.error("Enter your admin password."); return; }
    setStep(2);
  };

  const handleReset = async () => {
    if (confirmText !== "RESET SKYRISE") {
      toast.error('Type exactly "RESET SKYRISE" to confirm.');
      return;
    }
    setStep(3);
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) { toast.error("Not authenticated."); setStep(0); return; }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/system-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ admin_password: password, confirmation_text: confirmText }),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        toast.error(result.error || "Reset failed.");
        setStep(2);
        return;
      }

      toast.success(`System reset complete. ${result.deleted_users} users removed.`);
      setStep(0);
      setPassword("");
      setConfirmText("");
      // Reload page to refresh all data
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      toast.error(err.message || "Reset failed.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStep(0);
    setPassword("");
    setConfirmText("");
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <div className="border-2 border-destructive/40 rounded-xl p-8 bg-destructive/5 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-destructive/15 flex items-center justify-center">
            <Bomb className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground">Irreversible system reset</p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm text-destructive">
            <p className="font-semibold mb-1">This action is irreversible</p>
            <p>This will permanently delete all users, balances, AAA assignments, task records, and transaction history. Only admin accounts and system configuration will be preserved.</p>
          </div>
        </div>

        {/* What will be deleted */}
        <div className="space-y-2 text-sm">
          <p className="font-medium text-foreground">Will be deleted:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li>All non-admin users & profiles</li>
            <li>All balances & escrow</li>
            <li>All AAA assignments & task records</li>
            <li>All transactions, deposits & withdrawals</li>
            <li>All support tickets & messages</li>
            <li>All admin logs</li>
          </ul>
          <p className="font-medium text-foreground mt-3">Will be preserved:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li>Admin accounts (balances reset to 0)</li>
            <li>System configuration & plans</li>
          </ul>
        </div>

        {/* Step 0: Initial */}
        {step === 0 && (
          <Button variant="destructive" className="w-full" onClick={handleStartReset}>
            <Bomb className="h-4 w-4 mr-2" />
            Begin System Reset
          </Button>
        )}

        {/* Step 1: Password */}
        {step === 1 && (
          <div className="space-y-4 border-t border-destructive/20 pt-4">
            <p className="text-sm font-medium">Step 1: Enter the Danger Zone password</p>
            <Input
              type="password"
              placeholder="Danger Zone password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
              className="border-destructive/30"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="flex-1">Cancel</Button>
              <Button variant="destructive" onClick={handlePasswordSubmit} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation text */}
        {step === 2 && (
          <div className="space-y-4 border-t border-destructive/20 pt-4">
            <p className="text-sm font-medium">Step 2: Type <span className="font-mono bg-destructive/10 px-2 py-0.5 rounded text-destructive">RESET SKYRISE</span> to confirm</p>
            <Input
              type="text"
              placeholder='Type "RESET SKYRISE"'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReset()}
              className="border-destructive/30 font-mono"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="flex-1">Cancel</Button>
              <Button
                variant="destructive"
                onClick={handleReset}
                disabled={confirmText !== "RESET SKYRISE"}
                className="flex-1"
              >
                Execute Reset
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 3 && (
          <div className="flex flex-col items-center gap-3 border-t border-destructive/20 pt-6">
            <Loader2 className="h-8 w-8 animate-spin text-destructive" />
            <p className="text-sm text-muted-foreground">Resetting system... Do not close this page.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DangerZoneTab;

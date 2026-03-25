import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type View = "main" | "edit-profile" | "update-password" | "update-transaction-password";

const slideVariants = {
  enter: { x: "100%", opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: "-30%", opacity: 0 },
};

const Header = ({ title, onBack }: { title: string; onBack?: () => void }) => (
  <div className="relative flex items-center justify-center h-12 bg-foreground text-background rounded-t-xl">
    {onBack && (
      <button onClick={onBack} className="absolute left-3 p-1">
        <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
      </button>
    )}
    <h1 className="text-sm font-semibold">{title}</h1>
  </div>
);

const MenuItem = ({ label, value, onClick }: { label: string; value?: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between w-full px-4 py-3.5 text-left border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
  >
    <span className="text-sm">{label}</span>
    <div className="flex items-center gap-2">
      {value && <span className="text-sm text-muted-foreground">{value}</span>}
      {onClick && <ChevronRight className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />}
    </div>
  </button>
);

const PersonalInfo = () => {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("main");

  // Edit profile state
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [gender, setGender] = useState(profile?.gender || "");
  const [saving, setSaving] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Transaction password state
  const [oldTxPassword, setOldTxPassword] = useState("");
  const [newTxPassword, setNewTxPassword] = useState("");
  const [confirmTxPassword, setConfirmTxPassword] = useState("");
  const [updatingTxPassword, setUpdatingTxPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim(), gender: gender.trim() })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to update profile.");
    } else {
      toast.success("Profile updated successfully.");
      await refreshProfile();
      setView("main");
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setUpdatingPassword(true);
    // Verify old password by re-signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile?.email || "",
      password: oldPassword,
    });
    if (signInError) {
      setUpdatingPassword(false);
      toast.error("Old password is incorrect.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdatingPassword(false);
    if (error) {
      toast.error("Failed to update password.");
    } else {
      toast.success("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setView("main");
    }
  };

  const handleUpdateTxPassword = async () => {
    if (!user) return;
    if (newTxPassword.length < 6) {
      toast.error("Transaction password must be at least 6 characters.");
      return;
    }
    if (newTxPassword !== confirmTxPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    // Check old tx password
    if (profile?.withdraw_password && profile.withdraw_password !== oldTxPassword) {
      toast.error("Old transaction password is incorrect.");
      return;
    }
    setUpdatingTxPassword(true);
    const { error } = await supabase
      .from("profiles")
      .update({ withdraw_password: newTxPassword })
      .eq("user_id", user.id);
    setUpdatingTxPassword(false);
    if (error) {
      toast.error("Failed to update transaction password.");
    } else {
      toast.success("Transaction password updated successfully.");
      await refreshProfile();
      setOldTxPassword("");
      setNewTxPassword("");
      setConfirmTxPassword("");
      setView("main");
    }
  };

  const goBack = () => setView("main");

  return (
    <AppLayout>
      <div className="px-4 py-5">
        <AnimatePresence mode="wait">
          {view === "main" && (
            <motion.div
              key="main"
              variants={slideVariants}
              initial={false}
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Header title="Modify Information" onBack={() => navigate("/app/profile")} />
              <div className="rounded-b-xl overflow-hidden border border-t-0 border-border bg-card">
                <MenuItem
                  label="Modify Personal Information"
                  onClick={() => {
                    setFullName(profile?.full_name || "");
                    setPhone(profile?.phone || "");
                    setGender(profile?.gender || "");
                    setView("edit-profile");
                  }}
                />
                <MenuItem label="Username" value={profile?.username || "—"} />
                <MenuItem label="Phone" value={profile?.phone || "—"} />
                <MenuItem label="Update Password" onClick={() => setView("update-password")} />
                <MenuItem label="Update Transaction Password" onClick={() => setView("update-transaction-password")} />
              </div>
            </motion.div>
          )}

          {view === "edit-profile" && (
            <motion.div
              key="edit-profile"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Header title="Personal Information" onBack={goBack} />
              <div className="rounded-b-xl border border-t-0 border-border bg-card p-5 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Gender</label>
                  <Input value={gender} onChange={(e) => setGender(e.target.value)} placeholder="Gender" />
                </div>
                <Button onClick={handleSaveProfile} disabled={saving} className="w-full h-12">
                  {saving ? "Saving…" : "Update"}
                </Button>
              </div>
            </motion.div>
          )}

          {view === "update-password" && (
            <motion.div
              key="update-password"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Header title="Update Password" onBack={goBack} />
              <div className="rounded-b-xl border border-t-0 border-border bg-card p-5 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Old Password</label>
                  <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Old Password" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">New Password</label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" />
                </div>
                <Button onClick={handleUpdatePassword} disabled={updatingPassword} className="w-full h-12">
                  {updatingPassword ? "Updating…" : "Update"}
                </Button>
              </div>
            </motion.div>
          )}

          {view === "update-transaction-password" && (
            <motion.div
              key="update-tx-password"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Header title="Update Transaction Password" onBack={goBack} />
              <div className="rounded-b-xl border border-t-0 border-border bg-card p-5 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Old Password</label>
                  <Input type="password" value={oldTxPassword} onChange={(e) => setOldTxPassword(e.target.value)} placeholder="Old Password" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">New Password</label>
                  <Input type="password" value={newTxPassword} onChange={(e) => setNewTxPassword(e.target.value)} placeholder="New Password" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input type="password" value={confirmTxPassword} onChange={(e) => setConfirmTxPassword(e.target.value)} placeholder="Confirm New Password" />
                </div>
                <Button onClick={handleUpdateTxPassword} disabled={updatingTxPassword} className="w-full h-12">
                  {updatingTxPassword ? "Updating…" : "Update"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default PersonalInfo;

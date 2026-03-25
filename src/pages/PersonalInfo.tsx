import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, UserCircle, Phone,
  KeyRound, ShieldCheck, Pencil, User, Lock, Camera, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type View = "main" | "edit-profile" | "update-password" | "update-transaction-password";

const slideVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
};

const Header = ({ title, onBack }: { title: string; onBack?: () => void }) => (
  <div className="flex items-center gap-3 mb-6">
    {onBack && (
      <button
        onClick={onBack}
        className="flex items-center justify-center h-9 w-9 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      </button>
    )}
    <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
  </div>
);

const MenuItem = ({
  label,
  value,
  icon: Icon,
  onClick,
  accent,
}: {
  label: string;
  value?: string;
  icon: React.ElementType;
  onClick?: () => void;
  accent?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className={`group flex items-center gap-3.5 w-full px-4 py-3.5 text-left transition-all duration-200 ${
      onClick ? "hover:bg-muted/40 active:scale-[0.99]" : "cursor-default"
    }`}
  >
    <div className={`flex items-center justify-center h-9 w-9 rounded-xl shrink-0 ${
      accent ? "bg-primary/10 text-primary" : "bg-muted/60 text-muted-foreground"
    }`}>
      <Icon className="h-4 w-4" strokeWidth={1.5} />
    </div>
    <span className="flex-1 text-sm font-medium">{label}</span>
    <div className="flex items-center gap-2">
      {value && (
        <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg font-mono">
          {value}
        </span>
      )}
      {onClick && (
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" strokeWidth={1.5} />
      )}
    </div>
  </button>
);

const FormCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
    {children}
  </div>
);

const FieldGroup = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const PersonalInfo = () => {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("main");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
      <div className="px-4 py-5 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {/* ─── Main Menu ─── */}
          {view === "main" && (
            <motion.div
              key="main"
              variants={slideVariants}
              initial={false}
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <Header title="Account Settings" onBack={() => navigate("/app/profile")} />

              {/* User summary card */}
              <div
                className="rounded-2xl border border-border p-5 mb-4 flex items-center gap-4"
                style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{profile?.username || profile?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{profile?.email || "—"}</p>
                </div>
              </div>

              {/* Menu sections */}
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-1">Profile</p>
                <FormCard>
                  <MenuItem
                    label="Edit Personal Info"
                    icon={Pencil}
                    accent
                    onClick={() => {
                      setFullName(profile?.full_name || "");
                      setPhone(profile?.phone || "");
                      setGender(profile?.gender || "");
                      setView("edit-profile");
                    }}
                  />
                  <div className="mx-4 border-t border-border" />
                  <MenuItem label="Username" icon={UserCircle} value={profile?.username || "—"} />
                  <div className="mx-4 border-t border-border" />
                  <MenuItem label="Phone" icon={Phone} value={profile?.phone || "—"} />
                </FormCard>

                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-1 pt-2">Security</p>
                <FormCard>
                  <MenuItem
                    label="Update Password"
                    icon={KeyRound}
                    accent
                    onClick={() => {
                      setOldPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setView("update-password");
                    }}
                  />
                  <div className="mx-4 border-t border-border" />
                  <MenuItem
                    label="Transaction Password"
                    icon={ShieldCheck}
                    accent
                    onClick={() => {
                      setOldTxPassword("");
                      setNewTxPassword("");
                      setConfirmTxPassword("");
                      setView("update-transaction-password");
                    }}
                  />
                </FormCard>
              </div>
            </motion.div>
          )}

          {/* ─── Edit Profile ─── */}
          {view === "edit-profile" && (
            <motion.div
              key="edit-profile"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <Header title="Personal Information" onBack={goBack} />
              <FormCard>
                <div className="p-5 space-y-5">
                  <FieldGroup label="Full Name">
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className="h-11" />
                  </FieldGroup>
                  <FieldGroup label="Phone Number">
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" className="h-11" />
                  </FieldGroup>
                  <FieldGroup label="Gender">
                    <Input value={gender} onChange={(e) => setGender(e.target.value)} placeholder="Enter gender" className="h-11" />
                  </FieldGroup>
                  <Button onClick={handleSaveProfile} disabled={saving} className="w-full h-12 mt-2 font-semibold">
                    {saving ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </FormCard>
            </motion.div>
          )}

          {/* ─── Update Password ─── */}
          {view === "update-password" && (
            <motion.div
              key="update-password"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <Header title="Update Password" onBack={goBack} />
              <FormCard>
                <div className="p-5 space-y-5">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 mb-1">
                    <Lock className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
                    <p className="text-xs text-muted-foreground">Choose a strong password with at least 8 characters.</p>
                  </div>
                  <FieldGroup label="Current Password">
                    <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter current password" className="h-11" />
                  </FieldGroup>
                  <FieldGroup label="New Password">
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="h-11" />
                  </FieldGroup>
                  <FieldGroup label="Confirm Password">
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="h-11" />
                  </FieldGroup>
                  <Button onClick={handleUpdatePassword} disabled={updatingPassword} className="w-full h-12 mt-2 font-semibold">
                    {updatingPassword ? "Updating…" : "Update Password"}
                  </Button>
                </div>
              </FormCard>
            </motion.div>
          )}

          {/* ─── Update Transaction Password ─── */}
          {view === "update-transaction-password" && (
            <motion.div
              key="update-tx-password"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <Header title="Transaction Password" onBack={goBack} />
              <FormCard>
                <div className="p-5 space-y-5">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 mb-1">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
                    <p className="text-xs text-muted-foreground">This password is required for withdrawals and transfers.</p>
                  </div>
                  <FieldGroup label="Current Password">
                    <Input type="password" value={oldTxPassword} onChange={(e) => setOldTxPassword(e.target.value)} placeholder="Enter current password" className="h-11" />
                  </FieldGroup>
                  <FieldGroup label="New Password">
                    <Input type="password" value={newTxPassword} onChange={(e) => setNewTxPassword(e.target.value)} placeholder="Enter new password" className="h-11" />
                  </FieldGroup>
                  <FieldGroup label="Confirm Password">
                    <Input type="password" value={confirmTxPassword} onChange={(e) => setConfirmTxPassword(e.target.value)} placeholder="Confirm new password" className="h-11" />
                  </FieldGroup>
                  <Button onClick={handleUpdateTxPassword} disabled={updatingTxPassword} className="w-full h-12 mt-2 font-semibold">
                    {updatingTxPassword ? "Updating…" : "Update Password"}
                  </Button>
                </div>
              </FormCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default PersonalInfo;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Lock, User } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter credentials.");
      return;
    }

    setLoading(true);
    try {
      // Resolve username to email
      const { data: emailData, error: emailError } = await supabase.rpc("get_email_by_username", { _username: username });
      if (emailError || !emailData) {
        toast.error("Invalid credentials.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: emailData,
        password,
      });
      if (signInError) {
        toast.error("Invalid credentials.");
        return;
      }

      // Verify admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Authentication failed.");
        await supabase.auth.signOut();
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        toast.error("Access denied. Admin only.");
        await supabase.auth.signOut();
        return;
      }

      navigate("/admin-sky-987");
    } catch {
      toast.error("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm mx-4">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-xl font-semibold text-center tracking-tight mb-1">Admin Access</h1>
        <p className="text-xs text-muted-foreground text-center mb-8">Authorized personnel only</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 h-11 bg-muted/30 border-border/50"
              type="text"
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-11 bg-muted/30 border-border/50"
              type="password"
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 font-semibold tracking-wide">
            {loading ? "Authenticating..." : "Sign In"}
          </Button>
        </form>

        <p className="text-[10px] text-muted-foreground/50 text-center mt-8 tracking-wide">SECURE PORTAL • ENCRYPTED</p>
      </div>
    </div>
  );
};

export default AdminLogin;

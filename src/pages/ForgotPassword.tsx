import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("If an account exists with that email, a reset link has been sent.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(217,91%,60%,0.05),_transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            Sky<span className="text-primary">rise</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Reset password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your email to receive a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card flex flex-col gap-4 p-8">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="you@example.com" required className="bg-background" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" className="btn-press mt-2" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

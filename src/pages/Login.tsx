import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Check, X, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import SkyriseLogo from "@/components/SkyriseLogo";


import heroCar1 from "@/assets/hero-car-1.jpg";
import heroCar2 from "@/assets/hero-car-2.jpg";
import heroCar3 from "@/assets/hero-car-3.jpg";

const slides = [heroCar1, heroCar2, heroCar3];

const getPasswordStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
};

const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const strengthColors = [
  "bg-destructive",
  "bg-destructive",
  "bg-warning",
  "bg-success",
  "bg-success",
];

const Login = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";
  const refCode = searchParams.get("ref") || "";

  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Login state
  const [loginAccount, setLoginAccount] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [withdrawPw, setWithdrawPw] = useState("");
  const [gender, setGender] = useState("");
  const [referralCode, setReferralCode] = useState(refCode);
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [showWithdrawPw, setShowWithdrawPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) navigate("/app", { replace: true });
  }, [session, navigate]);

  // Slide timer
  useEffect(() => {
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const pwStrength = useMemo(() => getPasswordStrength(regPassword), [regPassword]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginAccount.trim() || !loginPassword.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoginLoading(true);
    try {
      // Look up email by username using secure RPC function
      const { data: userEmail, error: lookupError } = await supabase
        .rpc("get_email_by_username", { _username: loginAccount.trim() });

      if (lookupError || !userEmail) {
        toast.error("User not found");
        setLoginLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: loginPassword,
      });
      if (error) {
        toast.error("Invalid credentials");
      } else {
        // Check if user has admin role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: adminRole } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();
          if (adminRole) {
            toast.success("Logged in", { duration: 2000, position: "top-center" });
            navigate("/admin-sky-987/dashboard");
            return;
          }
        }
        toast.success("Logged in", { duration: 2000, position: "top-center" });
        navigate("/app");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!username.trim()) errors.username = "Username is required";
    if (!phone.trim()) errors.phone = "Phone number is required";
    if (!email.trim()) errors.email = "Email is required";
    if (regPassword.length < 8) errors.regPassword = "Password must be at least 8 characters";
    if (regPassword !== regConfirm) errors.regConfirm = "Passwords do not match";
    if (!withdrawPw.trim()) errors.withdrawPw = "Withdraw password is required";
    if (!gender) errors.gender = "Please select your gender";
    if (!referralCode.trim()) errors.referralCode = "Referral code is required";
    if (!agreed) errors.agreed = "You must agree to the Terms & Conditions";

    setRegErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fill all required fields");
      return;
    }

    setRegLoading(true);

    try {
      // Validate referral code exists using security definer function (works without auth)
      const { data: isValid, error: refError } = await supabase
        .rpc("validate_referral_code", { _code: referralCode.trim() });

      if (refError || !isValid) {
        setRegErrors({ referralCode: "Invalid referral code. Please enter a valid invite code." });
        toast.error("Invalid referral code. Please enter a valid invite code.");
        setRegLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: regPassword,
        options: {
          data: {
            full_name: username.trim(),
            phone: phone.trim(),
            username: username.trim(),
            gender,
            withdraw_password: withdrawPw,
            referred_by: referralCode.toUpperCase().trim(),
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        toast.error(error.message);
      } else if (data.user && !data.session) {
        // Email confirmation required
        toast.success("Account created! Please check your email to verify.");
        setTab("login");
      } else {
        toast.success("Account created successfully!");
        navigate("/app");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  if (session) return null;

  return (
    <div className="flex min-h-screen relative">
      
      {/* Left — Image slider (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-white">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-12 z-10">
          <Link to="/" className="mb-6">
            <SkyriseLogo className="h-16 w-auto" />
          </Link>
          <p className="text-center text-lg text-foreground/80 max-w-md leading-relaxed">
            Access your account and continue earning with Skyrise
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
          className="w-full max-w-md"
        >
          {/* Logo on mobile */}
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="inline-block">
              <SkyriseLogo className="h-14 w-auto" />
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 rounded-lg bg-muted p-1">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all duration-200 ${
                tab === "login"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all duration-200 ${
                tab === "register"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
              >
                <div className="glass-card p-8">
                  <h1 className="text-xl font-semibold tracking-tight mb-1">Welcome back</h1>
                  <p className="text-sm text-muted-foreground mb-6">Sign in to your account</p>

                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium">User ID</label>
                      <Input
                        type="text"
                        placeholder=""
                        required
                        className="bg-background"
                        value={loginAccount}
                        onChange={(e) => setLoginAccount(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Password</label>
                      </div>
                      <div className="relative">
                        <Input
                          type={showLoginPw ? "text" : "password"}
                          placeholder=""
                          required
                          className="bg-background pr-10"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPw(!showLoginPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showLoginPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="btn-press mt-2" disabled={loginLoading}>
                      {loginLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>

                  <p className="mt-5 text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button onClick={() => setTab("register")} className="text-primary hover:underline">
                      Create one
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
              >
                <div className="glass-card p-8 max-h-[75vh] overflow-y-auto">
                  <h1 className="text-xl font-semibold tracking-tight mb-1">Create your account</h1>
                  <p className="text-sm text-muted-foreground mb-6">Start earning with Skyrise</p>

                  <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
                    {/* Username */}
                    <FieldWrapper label="Username" error={regErrors.username}>
                      <Input
                        placeholder=""
                        className="bg-background"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </FieldWrapper>

                    {/* Phone */}
                    <FieldWrapper label="Phone Number" error={regErrors.phone}>
                      <Input
                        type="tel"
                        placeholder=""
                        className="bg-background"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </FieldWrapper>

                    {/* Email */}
                    <FieldWrapper label="Email" error={regErrors.email}>
                      <Input
                        type="email"
                        placeholder=""
                        className="bg-background"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </FieldWrapper>

                    {/* Login Password */}
                    <FieldWrapper label="Login Password" error={regErrors.regPassword}>
                      <div className="relative">
                        <Input
                          type={showRegPw ? "text" : "password"}
                          placeholder=""
                          className="bg-background pr-10"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPw(!showRegPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showRegPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {regPassword.length > 0 && (
                        <div className="mt-1.5">
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-colors ${
                                  i < pwStrength ? strengthColors[pwStrength] : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-0.5 block">
                            {strengthLabels[pwStrength]}
                          </span>
                        </div>
                      )}
                    </FieldWrapper>

                    {/* Confirm Password */}
                    <FieldWrapper label="Confirm Password" error={regErrors.regConfirm}>
                      <div className="relative">
                        <Input
                          type={showRegConfirm ? "text" : "password"}
                          placeholder=""
                          className="bg-background pr-10"
                          value={regConfirm}
                          onChange={(e) => setRegConfirm(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirm(!showRegConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showRegConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {regConfirm.length > 0 && regPassword.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {regPassword === regConfirm ? (
                            <><Check className="h-3 w-3 text-success" /><span className="text-[10px] text-success">Passwords match</span></>
                          ) : (
                            <><X className="h-3 w-3 text-destructive" /><span className="text-[10px] text-destructive">Passwords don't match</span></>
                          )}
                        </div>
                      )}
                    </FieldWrapper>

                    {/* Withdraw Password */}
                    <FieldWrapper label="Withdraw Password" error={regErrors.withdrawPw}>
                      <div className="relative">
                        <Input
                          type={showWithdrawPw ? "text" : "password"}
                          placeholder=""
                          className="bg-background pr-10"
                          value={withdrawPw}
                          onChange={(e) => setWithdrawPw(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowWithdrawPw(!showWithdrawPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showWithdrawPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FieldWrapper>

                    {/* Gender */}
                    <FieldWrapper label="Gender" error={regErrors.gender}>
                      <div className="relative">
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </FieldWrapper>

                    {/* Referral Code */}
                    <FieldWrapper label="Referral Code" error={regErrors.referralCode}>
                      <Input
                        placeholder=""
                        className="bg-background uppercase"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        readOnly={!!refCode}
                      />
                    </FieldWrapper>

                    {/* Terms */}
                    <div className="flex items-start gap-2 mt-1">
                      <Checkbox
                        id="terms"
                        checked={agreed}
                        onCheckedChange={(checked) => setAgreed(checked === true)}
                        className="mt-0.5"
                      />
                      <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                        I agree to the{" "}
                        <Link to="/app/terms" className="text-primary hover:underline">
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <span className="text-primary hover:underline cursor-pointer">
                          Privacy Policy
                        </span>
                      </label>
                    </div>
                    {regErrors.agreed && (
                      <span className="text-[11px] text-destructive -mt-2">{regErrors.agreed}</span>
                    )}

                    <Button type="submit" className="btn-press mt-2" disabled={regLoading}>
                      {regLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>

                  <p className="mt-5 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button onClick={() => setTab("login")} className="text-primary hover:underline">
                      Sign in
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

const FieldWrapper = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">{label}</label>
    {children}
    {error && <span className="text-[11px] text-destructive">{error}</span>}
  </div>
);

export default Login;

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ShieldCheck, Upload, Camera, FileCheck,
  Loader2, CheckCircle2, AlertCircle, IdCard
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const idTypes = ["National ID", "Passport", "Driver's License", "Residence Permit"];

const KYC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [name, setName] = useState(profile?.full_name || "");
  const [idNumber, setIdNumber] = useState("");
  const [idType, setIdType] = useState(idTypes[0]);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const kycStatus = (profile as any)?.kyc_status || "pending";
  const isVerified = kycStatus === "verified";
  const isSubmitted = kycStatus === "submitted";

  // Full-screen status for submitted/verified states
  if (isSubmitted) {
    return (
      <AppLayout>
        <div className="px-4 py-5 pb-24 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-all"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <h1 className="text-lg font-semibold tracking-tight">KYC Verification</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center text-center pt-8"
          >
            {/* Animated rings */}
            <div className="relative mb-8">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.05, 0.15] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 -m-6 rounded-full bg-amber-400/20"
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.08, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute inset-0 -m-3 rounded-full bg-amber-400/15"
              />
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-400/30 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-8 w-8 text-amber-500" strokeWidth={1.5} />
                </motion.div>
              </div>
            </div>

            <h2 className="text-xl font-bold tracking-tight mb-2">Verification In Progress</h2>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
              Your identity documents have been submitted and are currently being reviewed by our compliance team.
            </p>

            {/* Timeline */}
            <div className="w-full max-w-xs space-y-0">
              <div className="flex items-center gap-3 p-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold">Documents Submitted</p>
                  <p className="text-[10px] text-muted-foreground">Successfully uploaded</p>
                </div>
              </div>
              <div className="ml-[15px] h-5 border-l border-dashed border-amber-400/40" />
              <div className="flex items-center gap-3 p-3">
                <div className="h-8 w-8 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4 text-amber-500" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold">Under Review</p>
                  <p className="text-[10px] text-muted-foreground">Estimated within 24 hours</p>
                </div>
              </div>
              <div className="ml-[15px] h-5 border-l border-dashed border-border" />
              <div className="flex items-center gap-3 p-3 opacity-40">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold">Verified</p>
                  <p className="text-[10px] text-muted-foreground">Pending completion</p>
                </div>
              </div>
            </div>

            {/* Info card */}
            <div className="w-full rounded-xl border border-border bg-card p-4 mt-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-[11px] text-muted-foreground leading-relaxed text-left">
                  You will be notified once your identity has been verified. Withdrawals will be enabled automatically upon approval.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  if (isVerified) {
    return (
      <AppLayout>
        <div className="px-4 py-5 pb-24 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-all"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <h1 className="text-lg font-semibold tracking-tight">KYC Verification</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center text-center pt-8"
          >
            {/* Success icon */}
            <div className="relative mb-8">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute inset-0 -m-6 rounded-full bg-emerald-500"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.15 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute inset-0 -m-3 rounded-full bg-emerald-500"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4, type: "spring", stiffness: 200 }}
                className="relative h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"
              >
                <CheckCircle2 className="h-9 w-9 text-white" strokeWidth={2} />
              </motion.div>
            </div>

            <h2 className="text-xl font-bold tracking-tight mb-2">Identity Verified</h2>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-8">
              Your identity has been successfully verified. All platform features including withdrawals are now fully enabled.
            </p>

            {/* Verified details card */}
            <div className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" strokeWidth={2} />
                  Verified
                </span>
              </div>
              {(profile as any)?.kyc_name && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Name</span>
                  <span className="text-xs font-medium">{(profile as any).kyc_name}</span>
                </div>
              )}
              {(profile as any)?.kyc_id_type && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Document</span>
                  <span className="text-xs font-medium">{(profile as any).kyc_id_type}</span>
                </div>
              )}
              {(profile as any)?.kyc_id_number && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">ID Number</span>
                  <span className="text-xs font-medium">
                    ••••{(profile as any).kyc_id_number.slice(-4)}
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={() => navigate("/app/profile")}
              variant="outline"
              className="mt-6 w-full"
            >
              Back to Profile
            </Button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  const handleFileSelect = (
    file: File | undefined,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void
  ) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${folder}.${ext}`;
    const { error } = await supabase.storage
      .from("kyc-documents")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("kyc-documents").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!name.trim() || !idNumber.trim()) {
      toast.error("Fill in name and ID");
      return;
    }
    if (!frontFile || !backFile || !selfieFile) {
      toast.error("Upload all documents");
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const [frontUrl, backUrl, selfieUrl] = await Promise.all([
        uploadFile(frontFile, "id-front"),
        uploadFile(backFile, "id-back"),
        uploadFile(selfieFile, "selfie"),
      ]);

      const { error } = await supabase.rpc("submit_kyc", {
        _kyc_name: name.trim(),
        _kyc_id_number: idNumber.trim(),
        _kyc_id_type: idType,
        _kyc_front_url: frontUrl,
        _kyc_back_url: backUrl,
        _kyc_selfie_url: selfieUrl,
      });

      if (error) throw error;
      toast.success("Submitted");
      navigate("/app/profile");
    } catch (err: any) {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const UploadBox = ({
    label,
    icon: Icon,
    preview,
    inputRef,
    onSelect,
  }: {
    label: string;
    icon: any;
    preview: string | null;
    inputRef: React.RefObject<HTMLInputElement>;
    onSelect: (f: File | undefined) => void;
  }) => (
    <div className="space-y-2">
      <label className="text-xs font-medium text-foreground/70">{label}</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-40 rounded-xl border-2 border-dashed border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/[0.03] transition-all duration-200 overflow-hidden group"
      >
        {preview ? (
          <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover rounded-xl" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <Icon className="h-5 w-5 text-primary/60" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-muted-foreground">Tap to upload</span>
          </div>
        )}
        {preview && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
            <span className="text-xs text-white font-medium">Change photo</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onSelect(e.target.files?.[0])}
      />
    </div>
  );

  return (
    <AppLayout>
      <div className="px-4 py-5 pb-24 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-all"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">KYC Verification</h1>
            <p className="text-xs text-muted-foreground">Identity verification required</p>
          </div>
        </div>

        {/* Status Badge */}
        {(isVerified || isSubmitted) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2.5 p-4 rounded-xl mb-6 border ${
              isVerified
                ? "bg-success/5 border-success/20"
                : "bg-warning/5 border-warning/20"
            }`}
          >
            {isVerified ? (
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" strokeWidth={1.5} />
            ) : (
              <AlertCircle className="h-5 w-5 text-warning shrink-0" strokeWidth={1.5} />
            )}
            <div>
              <p className="text-sm font-medium">
                {isVerified ? "Identity Verified" : "Verification In Progress"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isVerified
                  ? "Your identity has been verified. Withdrawal is enabled."
                  : "Your documents have been submitted and are being reviewed. Verification will be completed within 24 hours."}
              </p>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-5"
        >
          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground/70">Full Legal Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              disabled={isSubmitted || isVerified}
              className="h-11 bg-card"
            />
          </div>

          {/* ID Number */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground/70">ID Card Number</label>
            <Input
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Enter your ID card number"
              disabled={isSubmitted || isVerified}
              className="h-11 bg-card"
            />
          </div>

          {/* ID Type */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground/70">Document Type</label>
            <select
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              disabled={isSubmitted || isVerified}
              className="w-full h-11 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:border-primary/40"
            >
              {idTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Document Uploads */}
          {!isVerified && !isSubmitted && (
            <div className="space-y-4 pt-1">
              <UploadBox
                label="Front of Identity Document"
                icon={IdCard}
                preview={frontPreview}
                inputRef={frontRef as React.RefObject<HTMLInputElement>}
                onSelect={(f) => handleFileSelect(f, setFrontFile, setFrontPreview)}
              />
              <UploadBox
                label="Back of Identity Document"
                icon={FileCheck}
                preview={backPreview}
                inputRef={backRef as React.RefObject<HTMLInputElement>}
                onSelect={(f) => handleFileSelect(f, setBackFile, setBackPreview)}
              />
              <UploadBox
                label="Selfie while holding your Identity Document"
                icon={Camera}
                preview={selfiePreview}
                inputRef={selfieRef as React.RefObject<HTMLInputElement>}
                onSelect={(f) => handleFileSelect(f, setSelfieFile, setSelfiePreview)}
              />
            </div>
          )}

          {/* Submit */}
          {!isVerified && !isSubmitted && (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 text-sm font-semibold mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  Submit Verification
                </>
              )}
            </Button>
          )}

          {/* Legal Notice */}
          <div className="rounded-xl border border-border bg-card p-4 mt-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="space-y-2.5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  To ensure the security of your account and to comply with U.S. anti-money laundering regulations, including the Bank Secrecy Act (BSA), the USA PATRIOT Act, and the Anti-Money Laundering (AML) requirements, you are required to complete the Know Your Customer (KYC) verification process.
                </p>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider mb-1">Data Security Notice</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    All documents you submit will be securely encrypted and kept strictly confidential. Your information will be used solely for identity verification and never for any unauthorized purposes. Once your documents are verified, your withdrawal function will be activated immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default KYC;

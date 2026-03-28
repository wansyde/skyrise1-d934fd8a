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
      toast.error("Please fill in your name and ID number");
      return;
    }
    if (!frontFile || !backFile || !selfieFile) {
      toast.error("Please upload all three documents");
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
      toast.success("KYC documents submitted successfully");
      navigate("/app/profile");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit KYC");
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
                  : "Your documents are being reviewed. This usually takes 24–48 hours."}
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

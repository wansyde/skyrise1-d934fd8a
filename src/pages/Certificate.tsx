import AppLayout from "@/components/layout/AppLayout";
import certificateImg from "@/assets/certificate.jpg";

const Certificate = () => (
  <AppLayout>
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-6">
      <img
        src={certificateImg}
        alt="Company Certificate"
        className="w-full max-w-2xl rounded-lg shadow-lg shadow-black/30 object-contain"
      />
    </div>
  </AppLayout>
);

export default Certificate;

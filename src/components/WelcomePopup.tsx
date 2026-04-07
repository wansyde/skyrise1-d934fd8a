import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import SkyriseLogo from "@/components/SkyriseLogo";
import popupCarImg from "@/assets/popup-car.png";

interface WelcomePopupProps {
  type: string;
  message: string;
  onDismiss: () => void;
}

const getTitle = (type: string) => {
  switch (type) {
    case "vip_upgrade": return "Level Upgraded";
    case "task_reset": return "Tasks Reset";
    case "deposit": return "Deposit Confirmed";
    default: return "Welcome Back";
  }
};

const WelcomePopup = ({ type, message, onDismiss }: WelcomePopupProps) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(165deg, hsl(260 60% 12%) 0%, hsl(250 40% 8%) 50%, hsl(240 30% 5%) 100%)",
          }}
        >
          {/* Top glow accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="relative flex justify-center pt-6 pb-2">
            <SkyriseLogo className="h-10 w-auto" />
          </div>

          {/* Title */}
          <div className="relative text-center px-6 pt-2">
            <h2 className="text-lg font-bold text-white tracking-tight font-[Montserrat,sans-serif]">
              {getTitle(type)}
            </h2>
          </div>

          {/* Car Image */}
          <div className="relative flex justify-center px-6 py-4">
            <img
              src={popupCarImg}
              alt="Premium vehicle"
              className="w-full max-w-[280px] h-auto object-contain drop-shadow-2xl"
              loading="lazy"
              width={800}
              height={600}
            />
          </div>

          {/* Message */}
          <div className="relative px-6 pb-4">
            <div className="rounded-xl border border-primary/30 bg-primary/10 backdrop-blur-sm px-5 py-4">
              <p className="text-sm text-white/90 text-center leading-relaxed font-[Inter,sans-serif]">
                {message}
              </p>
            </div>
          </div>

          {/* Bonus text */}
          <div className="relative px-6 pb-6">
            <p className="text-xs text-center text-white/50 leading-relaxed">
              Every time users complete three sets of promotional assignments, they can instantly contact customer service to claim a random bonus ranging from{" "}
              <span className="text-primary font-semibold underline">$1 to $1,000</span>.
            </p>
          </div>

          {/* Dismiss button */}
          <div className="relative flex justify-center pb-6">
            <button
              onClick={onDismiss}
              className="h-9 w-9 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomePopup;

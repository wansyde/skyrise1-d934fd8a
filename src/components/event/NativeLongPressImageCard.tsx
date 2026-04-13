import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

interface NativeLongPressImageCardProps {
  alt: string;
  delay?: number;
  description: string;
  icon: LucideIcon;
  imageSrc: string | null;
  title: string;
}

const nativeImageStyle: CSSProperties = {
  WebkitTouchCallout: "default",
  WebkitUserSelect: "auto",
  userSelect: "auto",
  touchAction: "auto",
};

const NativeLongPressImageCard = ({
  alt,
  delay = 0,
  description,
  icon: Icon,
  imageSrc,
  title,
}: NativeLongPressImageCardProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mb-8 select-none [-webkit-user-select:none]"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="font-[Montserrat] text-lg font-bold tracking-tight text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md rounded-[30px] bg-background p-2 shadow-[0_28px_70px_-32px_hsl(var(--foreground)/0.2)] ring-1 ring-border/60">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={alt}
            draggable={false}
            className="block w-full h-auto rounded-[24px] select-auto [-webkit-user-select:auto]"
            style={nativeImageStyle}
          />
        ) : (
          <div className="flex min-h-[280px] items-center justify-center rounded-[24px] bg-secondary/60 px-6 text-center text-sm text-muted-foreground">
            Preparing image…
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Long press the image to copy, save, or share
      </p>
    </motion.section>
  );
};

export default NativeLongPressImageCard;

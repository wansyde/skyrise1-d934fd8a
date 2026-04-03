import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle, AlertTriangle } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      visibleToasts={1}
      duration={2000}
      gap={8}
      offset={80}
      className="toaster group"
      icons={{
        success: <CheckCircle className="h-5 w-5 text-primary" strokeWidth={1.5} />,
        error: <AlertTriangle className="h-5 w-5 text-destructive" strokeWidth={1.5} />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-white !border !border-border/40 !shadow-[0_8px_30px_rgb(0,0,0,0.08)] !rounded-2xl !px-5 !py-4 !text-foreground !max-w-xs !mx-auto !backdrop-blur-sm",
          description: "!text-muted-foreground !text-xs",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-muted !text-muted-foreground",
          title: "!text-sm !font-medium",
        },
        style: {
          animationDuration: "300ms",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };

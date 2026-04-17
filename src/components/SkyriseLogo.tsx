import logoImg from "@/assets/skyrise-logo.jpg";

const SkyriseLogo = ({ className = "h-14 w-auto" }: { className?: string }) => (
  <img
    src={logoImg}
    alt="Skyrise"
    className={className}
    width={148}
    height={54}
    decoding="async"
    fetchPriority="high"
    style={{ objectFit: "contain" }}
  />
);

export default SkyriseLogo;

import logoImg from "@/assets/skyrise-logo.jpg";

const SkyriseLogo = ({ className = "h-14 w-auto" }: { className?: string }) => (
  <img
    src={logoImg}
    alt="Skyrise"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

export default SkyriseLogo;

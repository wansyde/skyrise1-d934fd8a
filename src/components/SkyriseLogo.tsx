const SkyriseLogo = ({ className = "h-8 w-auto" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    {/* S symbol */}
    <svg viewBox="0 0 36 36" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 3C9.716 3 3 9.716 3 18s6.716 15 15 15c4.97 0 9.374-2.42 12.11-6.15a1.5 1.5 0 0 0-2.47-1.7A12 12 0 1 1 30 18a1.5 1.5 0 0 0 3 0c0-8.284-6.716-15-15-15Z"
        fill="hsl(255 60% 58%)"
      />
      <path
        d="M18 10.5a7.5 7.5 0 0 0-6.36 3.52 1.5 1.5 0 0 0 2.54 1.6A4.5 4.5 0 1 1 18 22.5a1.5 1.5 0 0 0 0 3 7.5 7.5 0 1 0 0-15Z"
        fill="hsl(255 60% 58%)"
      />
    </svg>
    <span className="text-lg font-bold tracking-tight" style={{ color: "hsl(255 60% 58%)" }}>
      Skyrise
    </span>
  </div>
);

export default SkyriseLogo;

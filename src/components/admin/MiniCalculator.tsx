import { useState } from "react";
import { Calculator, X } from "lucide-react";

const MiniCalculator = () => {
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const input = (n: string) => {
    if (fresh) { setDisplay(n); setFresh(false); }
    else setDisplay(display === "0" && n !== "." ? n : display + n);
  };

  const operate = (next: string) => {
    const cur = parseFloat(display);
    if (prev !== null && op && !fresh) {
      const r = op === "+" ? prev + cur : op === "−" ? prev - cur : op === "×" ? prev * cur : op === "÷" && cur !== 0 ? prev / cur : cur;
      const rounded = Math.round(r * 100) / 100;
      setDisplay(String(rounded));
      setPrev(rounded);
    } else {
      setPrev(cur);
    }
    setOp(next);
    setFresh(true);
  };

  const equals = () => {
    if (prev === null || !op) return;
    const cur = parseFloat(display);
    const r = op === "+" ? prev + cur : op === "−" ? prev - cur : op === "×" ? prev * cur : op === "÷" && cur !== 0 ? prev / cur : cur;
    const rounded = Math.round(r * 100) / 100;
    setDisplay(String(rounded));
    setPrev(null);
    setOp(null);
    setFresh(true);
  };

  const clear = () => { setDisplay("0"); setPrev(null); setOp(null); setFresh(true); };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        <Calculator className="h-5 w-5" />
      </button>
    );
  }

  const btn = (label: string, action: () => void, className = "") => (
    <button
      onClick={action}
      className={`h-10 rounded-lg text-sm font-medium transition-colors ${className}`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 w-64 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Calculator className="h-3.5 w-3.5" /> Calculator
        </span>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Display */}
      <div className="px-4 py-3 text-right">
        {prev !== null && op && (
          <div className="text-[10px] text-muted-foreground tabular-nums">{prev} {op}</div>
        )}
        <div className="text-2xl font-semibold tabular-nums truncate text-foreground">{display}</div>
      </div>

      {/* Pad */}
      <div className="grid grid-cols-4 gap-1.5 p-3 pt-0">
        {btn("C", clear, "bg-destructive/15 text-destructive hover:bg-destructive/25")}
        {btn("÷", () => operate("÷"), "bg-muted text-foreground hover:bg-muted/70")}
        {btn("×", () => operate("×"), "bg-muted text-foreground hover:bg-muted/70")}
        {btn("−", () => operate("−"), "bg-muted text-foreground hover:bg-muted/70")}

        {["7","8","9"].map(n => btn(n, () => input(n), "bg-secondary text-secondary-foreground hover:bg-secondary/70"))}
        {btn("+", () => operate("+"), "bg-muted text-foreground hover:bg-muted/70")}

        {["4","5","6"].map(n => btn(n, () => input(n), "bg-secondary text-secondary-foreground hover:bg-secondary/70"))}
        {btn("=", equals, "row-span-2 bg-primary text-primary-foreground hover:opacity-90")}

        {["1","2","3"].map(n => btn(n, () => input(n), "bg-secondary text-secondary-foreground hover:bg-secondary/70"))}

        {btn("0", () => input("0"), "col-span-2 bg-secondary text-secondary-foreground hover:bg-secondary/70")}
        {btn(".", () => input("."), "bg-secondary text-secondary-foreground hover:bg-secondary/70")}
      </div>
    </div>
  );
};

export default MiniCalculator;

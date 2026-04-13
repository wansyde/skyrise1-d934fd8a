import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Trash2, Search } from "lucide-react";

const CAR_NAMES = [
  "Audi A1 2025 Sportback Premium Edition",
  "Audi RS e-tron GT 2025 Performance",
  "Aston Martin DB12 Volante 2025",
  "Aston Martin Vantage 2025 AMR",
  "Mercedes-Maybach S680 2025 Edition",
  "Mercedes-AMG GT 63 S E Performance",
  "BMW M4 Competition 2025 xDrive",
  "BMW iX M60 2025 Electric SUV",
  "Ferrari 296 GTB 2025 Assetto Fiorano",
  "Bentley Continental GT 2025 Speed",
  "Bentley Continental GT 2025 Azure",
  "Ford Mustang GT 2025 Premium",
  "Ferrari Roma 2025 Spider",
  "Cadillac CT5-V 2025 Blackwing",
  "Range Rover Autobiography 2025 LWB",
  "Lexus LC 500 2025 Inspiration Series",
  "McLaren Artura 2025 Spider",
  "McLaren GT 2025 Luxe",
  "Lexus ES 350 2025 Ultra Luxury",
  "Tesla Model S 2025 Plaid",
];

interface AdminAAATabProps {
  profiles: any[];
}

const AdminAAATab = ({ profiles }: AdminAAATabProps) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Form state
  const [targetUserId, setTargetUserId] = useState("");
  const [setNumber, setSetNumber] = useState("1");
  const [taskPosition, setTaskPosition] = useState("");
  const [numberOfCars, setNumberOfCars] = useState("3");
  const [commissionPercentage, setCommissionPercentage] = useState("5");
  const [commissionMode, setCommissionMode] = useState<"percentage" | "fixed">("percentage");
  const [selectedCars, setSelectedCars] = useState<{ name: string; price: string; commission: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: assignments = [] } = useQuery({
    queryKey: ["admin-aaa-assignments"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        console.error("AAA query: No active session");
        throw new Error("Not authenticated");
      }
      const { data, error } = await supabase
        .from("aaa_assignments" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("AAA assignments query error:", error);
        throw error;
      }
      console.log("AAA assignments loaded:", data?.length || 0);
      return (data || []) as any[];
    },
    retry: 2,
  });

  const getUserName = (userId: string | null) => {
    if (!userId) return "All Users (Global)";
    const p = profiles.find((p: any) => p.user_id === userId);
    return p?.username || p?.email || userId.slice(0, 8);
  };

  const totalAmount = selectedCars.reduce((sum, c) => sum + (parseFloat(c.price) || 0), 0);

  const handleCreate = async () => {
    const pos = parseInt(taskPosition);
    const numCars = parseInt(numberOfCars);
    const setNum = parseInt(setNumber);
    const commPct = parseFloat(commissionPercentage) / 100;

    if (!pos || pos < 1 || pos > 40) { toast.error("Enter a valid task position (1–40)"); return; }
    if (selectedCars.length < 2) { toast.error("Select at least 2 cars"); return; }
    if (selectedCars.length !== numCars) { toast.error(`Select exactly ${numCars} cars`); return; }
    if (selectedCars.some(c => !c.price || parseFloat(c.price) <= 0)) { toast.error("All cars must have a valid price"); return; }
    if (commissionMode === "percentage" && (commPct <= 0 || commPct > 1)) { toast.error("Enter a valid commission percentage (1–100)"); return; }

    const carNames = selectedCars.map(c => c.name);
    const carPrices = selectedCars.map(c => parseFloat(c.price));
    const carCommissions = commissionMode === "fixed"
      ? selectedCars.map(c => parseFloat(c.commission) || 0)
      : selectedCars.map(c => Math.round(parseFloat(c.price) * commPct * 100) / 100);

    setSubmitting(true);
    try {
      const { error } = await supabase.from("aaa_assignments" as any).insert({
        user_id: targetUserId || null,
        set_number: setNum,
        task_position: pos,
        number_of_cars: numCars,
        total_assignment_amount: totalAmount,
        car_names: carNames,
        car_prices: carPrices,
        car_commissions: carCommissions,
        profit_percentage: commPct,
        status: "active",
      } as any);
      if (error) throw error;
      toast.success("AAA assignment created");
      setTaskPosition("");
      setSelectedCars([]);
      setTargetUserId("");
      setSetNumber("1");
      setProfitPercentage("5");
      queryClient.invalidateQueries({ queryKey: ["admin-aaa-assignments"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from("aaa_assignments" as any).delete().eq("id", id);
      toast.success("Deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-aaa-assignments"] });
    } catch (e: any) {
      toast.error("Failed to delete");
    }
  };

  const handleAddCar = (carName: string) => {
    const maxCars = parseInt(numberOfCars) || 3;
    if (selectedCars.length >= maxCars) { toast.error(`Max ${maxCars} cars`); return; }
    if (selectedCars.find(c => c.name === carName)) return;
    setSelectedCars([...selectedCars, { name: carName, price: "", commission: "" }]);
  };

  const handleRemoveCar = (index: number) => {
    setSelectedCars(selectedCars.filter((_, i) => i !== index));
  };

  const handleCarFieldChange = (index: number, field: "price" | "commission", value: string) => {
    const updated = [...selectedCars];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedCars(updated);
  };

  const filteredAssignments = assignments.filter((a: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return getUserName(a.user_id).toLowerCase().includes(q) || (a.status || "").toLowerCase().includes(q);
  });

  const totalCommission = commissionMode === "fixed"
    ? selectedCars.reduce((sum, c) => sum + (parseFloat(c.commission) || 0), 0)
    : totalAmount * (parseFloat(profitPercentage) / 100 || 0);

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-medium mb-4">Create AAA Assignment</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Target User</label>
            <select
              value={targetUserId}
              onChange={e => setTargetUserId(e.target.value)}
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs"
            >
              <option value="">Global (All Users)</option>
              {profiles.map((p: any) => (
                <option key={p.user_id} value={p.user_id}>
                  {p.username || p.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Target Set</label>
            <select
              value={setNumber}
              onChange={e => setSetNumber(e.target.value)}
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs"
            >
              <option value="1">Set 1</option>
              <option value="2">Set 2</option>
              <option value="3">Set 3</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Position (1–40)</label>
            <Input value={taskPosition} onChange={e => setTaskPosition(e.target.value)} placeholder="e.g. 15" className="h-9 text-xs" type="number" min={1} max={40} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Number of Cars</label>
            <select
              value={numberOfCars}
              onChange={e => { setNumberOfCars(e.target.value); setSelectedCars([]); }}
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs"
            >
              {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Commission Mode</label>
            <select
              value={commissionMode}
              onChange={e => setCommissionMode(e.target.value as "percentage" | "fixed")}
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs"
            >
              <option value="percentage">% of Price</option>
              <option value="fixed">Fixed Value</option>
            </select>
          </div>
          {commissionMode === "percentage" && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Profit %</label>
              <Input value={profitPercentage} onChange={e => setProfitPercentage(e.target.value)} placeholder="e.g. 5" className="h-9 text-xs" type="number" min={1} max={100} />
            </div>
          )}
        </div>

        {/* Car selection with individual prices + commissions */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-2 block">Cars, Prices & Commissions ({selectedCars.length}/{numberOfCars})</label>
          
          {selectedCars.length > 0 && (
            <div className="space-y-2 mb-3">
              {selectedCars.map((car, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                  <span className="text-xs font-medium flex-1 truncate">{car.name}</span>
                  <Input
                    value={car.price}
                    onChange={e => handleCarFieldChange(i, "price", e.target.value)}
                    placeholder="Price (USDC)"
                    className="h-7 text-xs w-28"
                    type="number"
                    min={1}
                  />
                  {commissionMode === "fixed" && (
                    <Input
                      value={car.commission}
                      onChange={e => handleCarFieldChange(i, "commission", e.target.value)}
                      placeholder="Commission"
                      className="h-7 text-xs w-24"
                      type="number"
                      min={0}
                    />
                  )}
                  {commissionMode === "percentage" && car.price && (
                    <span className="text-[10px] text-muted-foreground w-20 text-right">
                      +{(parseFloat(car.price) * (parseFloat(profitPercentage) / 100 || 0)).toFixed(2)}
                    </span>
                  )}
                  <button onClick={() => handleRemoveCar(i)} className="text-destructive hover:text-destructive/80">×</button>
                </div>
              ))}
              <div className="flex justify-between text-xs font-bold">
                <span className="text-primary">Total: {totalAmount.toFixed(2)} USDC</span>
                <span className="text-emerald-600">Commission: {totalCommission.toFixed(2)} USDC</span>
              </div>
            </div>
          )}

          <select
            className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs"
            onChange={e => {
              if (e.target.value) handleAddCar(e.target.value);
              e.target.value = "";
            }}
            defaultValue=""
          >
            <option value="">Add a car...</option>
            {CAR_NAMES.filter(c => !selectedCars.find(s => s.name === c)).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <Button onClick={handleCreate} disabled={submitting} size="sm" className="gap-2">
          <Plus className="h-3.5 w-3.5" />
          {submitting ? "Creating..." : "Create AAA Assignment"}
        </Button>
      </div>

      {/* Assignments list */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">AAA Assignments</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-xs" placeholder="Search..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Target</th>
                <th className="px-4 py-3 text-center font-medium">Set</th>
                <th className="px-4 py-3 text-center font-medium">Position</th>
                <th className="px-4 py-3 text-center font-medium">Cars</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Cars + Prices + Commission</th>
                <th className="px-4 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((a: any) => (
                <tr key={a.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-xs">{getUserName(a.user_id)}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs">Set {a.set_number || 1}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs">#{a.task_position}</td>
                  <td className="px-4 py-3 text-center text-xs">{a.number_of_cars}</td>
                  <td className="px-4 py-3 text-right font-bold text-xs">{Number(a.total_assignment_amount).toLocaleString()} USDC</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      a.status === "active" ? "bg-emerald-100 text-emerald-700" :
                      a.status === "used" ? "bg-muted text-muted-foreground" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {(a.car_names || []).map((c: string, i: number) => (
                        <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded flex items-center justify-between gap-2">
                          <span className="truncate">{c.split(" ").slice(0, 2).join(" ")}</span>
                          <span className="flex gap-2">
                            {a.car_prices?.[i] != null && (
                              <span className="font-bold text-primary">{Number(a.car_prices[i]).toLocaleString()}</span>
                            )}
                            {a.car_commissions?.[i] != null && a.car_commissions[i] > 0 && (
                              <span className="font-bold text-emerald-600">+{Number(a.car_commissions[i]).toLocaleString()}</span>
                            )}
                          </span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(a.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAssignments.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-6 text-center text-sm text-muted-foreground">No AAA assignments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAAATab;

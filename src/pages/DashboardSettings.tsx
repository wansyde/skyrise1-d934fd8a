import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const DashboardSettings = () => {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings updated.");
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and security preferences.</p>
      </div>

      <div className="mx-auto max-w-lg flex flex-col gap-6">
        <form onSubmit={handleSave} className="glass-card p-8 flex flex-col gap-4">
          <h2 className="text-sm font-medium">Profile</h2>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">Full Name</label>
            <Input defaultValue="John Doe" className="bg-background" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">Email</label>
            <Input defaultValue="john@example.com" type="email" className="bg-background" disabled />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">Phone</label>
            <Input defaultValue="+1 (555) 000-0000" className="bg-background" />
          </div>
          <Button type="submit" className="btn-press self-end">Save Changes</Button>
        </form>

        <form onSubmit={(e) => { e.preventDefault(); toast.success("Password updated."); }} className="glass-card p-8 flex flex-col gap-4">
          <h2 className="text-sm font-medium">Security</h2>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">Current Password</label>
            <Input type="password" placeholder="••••••••" className="bg-background" required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">New Password</label>
            <Input type="password" placeholder="••••••••" className="bg-background" required minLength={8} />
          </div>
          <Button type="submit" className="btn-press self-end">Update Password</Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettings;

import { LayoutDashboard, ClipboardCheck, History } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: false },
  { icon: ClipboardCheck, label: "Evaluation", active: true },
  { icon: History, label: "History", active: false },
];

const Sidebar = () => {
  return (
    <aside className="flex flex-col items-center w-14 bg-sidebar py-4 gap-1 border-r border-sidebar-border shrink-0">
      <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center mb-4">
        <span className="text-sidebar-primary-foreground font-bold text-sm">B</span>
      </div>
      {navItems.map((item) => (
        <button
          key={item.label}
          title={item.label}
          className={cn(
            "w-10 h-10 rounded-md flex items-center justify-center transition-colors",
            item.active
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/60"
          )}
        >
          <item.icon className="w-5 h-5" />
        </button>
      ))}
    </aside>
  );
};

export default Sidebar;

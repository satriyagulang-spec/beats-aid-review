import { LayoutDashboard, ClipboardCheck, History } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: false },
  { icon: ClipboardCheck, label: "Evaluation", active: true },
  { icon: History, label: "History", active: false },
];

const Sidebar = () => {
  return (
    <aside className="flex flex-col items-center w-[56px] bg-sidebar py-3 gap-0.5 border-r border-sidebar-border shrink-0">
      <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center mb-6">
        <span className="text-sidebar-primary-foreground font-bold text-sm tracking-tight">B</span>
      </div>
      {navItems.map((item) => (
        <button
          key={item.label}
          title={item.label}
          className={cn(
            "w-10 h-10 rounded-lg flex flex-col items-center justify-center transition-all duration-150 gap-0.5",
            item.active
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
          )}
        >
          <item.icon className="w-[18px] h-[18px]" />
          <span className="text-[8px] font-medium leading-none">{item.label.slice(0, 4)}</span>
        </button>
      ))}
    </aside>
  );
};

export default Sidebar;

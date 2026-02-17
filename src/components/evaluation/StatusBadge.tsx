import { EvaluationStatus } from "@/types/hazard";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: EvaluationStatus;
}

const config: Record<EvaluationStatus, { label: string; className: string }> = {
  ai_pending: { label: "AI Pending", className: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", className: "bg-status-progress/15 text-status-progress border border-status-progress/30" },
  auto_confirmed: { label: "Auto Confirmed", className: "bg-ai/15 text-ai border border-ai/30" },
  completed: { label: "Completed", className: "bg-status-complete/15 text-status-complete border border-status-complete/30" },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const c = config[status];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap", c.className)}>
      {c.label}
    </span>
  );
};

export default StatusBadge;

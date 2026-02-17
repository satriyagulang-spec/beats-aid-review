import { useState, useEffect } from "react";
import { Clock, Lock, User } from "lucide-react";
import { AILabel } from "@/types/hazard";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AIBadgeProps {
  label: AILabel;
  onClick?: () => void;
  slaDeadline?: string;
  disabled?: boolean;
  editingBy?: string | null;
}

function getTimeRemaining(deadline: string): { hours: number; minutes: number; text: string } {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, text: "Expired" };
  const totalMinutes = Math.floor(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 1) {
    return { hours, minutes, text: `${hours}h ${minutes.toString().padStart(2, "0")}m` };
  }
  return { hours: 0, minutes, text: `${minutes}m left` };
}

const BADGE_BASE = "inline-flex flex-col items-start gap-0 px-2.5 py-1.5 rounded border text-[11px] font-normal w-[160px] min-w-[160px]";
const TAG_BASE = "text-[9px] font-bold shrink-0 px-1 rounded";

const AIBadge = ({ label, onClick, slaDeadline, disabled, editingBy }: AIBadgeProps) => {
  const [timeText, setTimeText] = useState("");
  const [hoursLeft, setHoursLeft] = useState(999);

  useEffect(() => {
    if (!slaDeadline || label.locked || label.auto_confirmed) return;
    const update = () => {
      const { hours, text } = getTimeRemaining(slaDeadline);
      setTimeText(text);
      setHoursLeft(hours);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [slaDeadline, label.locked, label.auto_confirmed]);

  const displayLabel = label.human_label || label.ai_label;
  const isHuman = !!label.human_label && label.locked && !label.auto_confirmed;
  const isAutoConfirmed = label.auto_confirmed;
  const topCandidate = label.candidates?.[0];
  const relevance = topCandidate?.relevance ?? 0;
  const candidates = label.candidates?.slice(0, 3) ?? [];

  if (!displayLabel) {
    return (
      <button
        onClick={disabled ? undefined : onClick}
        className={cn(BADGE_BASE, "border-dashed border-border text-muted-foreground hover:bg-muted transition-colors justify-center", disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer")}
      >
        No label
      </button>
    );
  }

  const candidatesTooltip = (
    <div className="space-y-1.5">
      <p className="font-semibold text-[11px] mb-1">Top AI Candidates</p>
      {candidates.map((c, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <span className="text-[11px]">
            <span className="text-muted-foreground mr-1">#{i + 1}</span>
            {c.label}
          </span>
          <span className="text-[10px] font-semibold shrink-0">{c.relevance}%</span>
        </div>
      ))}
      {slaDeadline && <p className="text-muted-foreground text-[10px] pt-1 border-t border-border">⏱ {timeText}</p>}
      {editingBy && <p className="text-destructive text-[10px] pt-1 border-t border-border">🔒 Being edited by {editingBy}</p>}
    </div>
  );

  // Auto-confirmed badge — AI tag + label + lock icon on right
  if (isAutoConfirmed) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div onClick={disabled ? undefined : onClick} className={cn(BADGE_BASE, "border-border bg-muted/40 text-foreground", disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
              <div className="flex items-center gap-1.5 w-full">
                <span className={cn(TAG_BASE, "text-muted-foreground bg-muted")}>AI</span>
                <span className="truncate font-medium text-left flex-1">{displayLabel}</span>
                <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
              </div>
              <span className="text-[9px] text-muted-foreground pl-[26px]">Auto-confirmed · {relevance}%</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px] text-xs p-2.5">
            <div className="space-y-0.5">
              <p className="font-semibold text-[11px]">Final Label: {displayLabel}</p>
              <p className="text-muted-foreground text-[10px]">Confirmed by: System (AI Auto-Confirm)</p>
              <p className="text-muted-foreground text-[10px]">Reason: SLA expired</p>
              <p className="text-muted-foreground text-[10px]">Relevance score: {relevance}%</p>
              {label.annotated_at && (
                <p className="text-muted-foreground text-[10px]">{new Date(label.annotated_at).toLocaleString()}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Human-locked badge — label + user icon + lock icon on right
  if (isHuman) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div onClick={disabled ? undefined : onClick} className={cn(BADGE_BASE, "border-primary/20 bg-primary/[0.04] text-foreground", disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
              <div className="flex items-center gap-1.5 w-full">
                <span className="truncate font-medium text-left flex-1">{displayLabel}</span>
                <User className="w-3 h-3 text-muted-foreground shrink-0" />
                <Lock className="w-3 h-3 text-primary shrink-0" />
              </div>
              <span className="text-[9px] text-muted-foreground">Manual Review</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px] text-xs p-2.5">
            <div className="space-y-0.5">
              <p className="font-semibold text-[11px]">Final Label: {displayLabel}</p>
              {label.annotated_by && (
                <p className="text-muted-foreground text-[10px]">Confirmed by: {label.annotated_by}</p>
              )}
              {label.annotated_at && (
                <p className="text-muted-foreground text-[10px]">{new Date(label.annotated_at).toLocaleString()}</p>
              )}
              <p className="text-muted-foreground text-[10px]">Relevance score: {relevance}%</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Pending AI badge
  const timerColor = hoursLeft < 1 ? "text-destructive" : hoursLeft < 6 ? "text-warning" : "text-muted-foreground";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={disabled ? undefined : onClick}
            className={cn(BADGE_BASE, "bg-background text-foreground border-border transition-colors", disabled ? "cursor-not-allowed opacity-50" : "hover:bg-muted/40 cursor-pointer")}
          >
            <div className="flex items-center gap-1.5 w-full">
              <span className={cn(TAG_BASE, "text-muted-foreground bg-muted")}>AI</span>
              <span className="truncate font-medium text-left flex-1">{displayLabel}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground pl-[26px]">
              <span>{relevance}%</span>
              {slaDeadline && (
                <span className={cn("flex items-center gap-0.5", timerColor)}>
                  <Clock className="w-2.5 h-2.5" />
                  {timeText}
                </span>
              )}
            </div>
            {editingBy && (
              <span className="text-[8px] text-destructive pl-[26px]">🔒 {editingBy} editing</span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px] text-xs p-2.5">
          {candidatesTooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AIBadge;

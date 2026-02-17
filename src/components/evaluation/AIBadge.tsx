import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { AILabel } from "@/types/hazard";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AIBadgeProps {
  label: AILabel;
  onClick?: () => void;
  slaDeadline?: string;
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

const AIBadge = ({ label, onClick, slaDeadline }: AIBadgeProps) => {
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
  const isHuman = !!label.human_label && label.locked;
  const isAutoConfirmed = label.auto_confirmed;
  const topCandidate = label.candidates?.[0];
  const relevance = topCandidate?.relevance ?? 0;
  const candidates = label.candidates?.slice(0, 3) ?? [];

  if (!displayLabel) {
    return (
      <button
        onClick={onClick}
        className={cn(BADGE_BASE, "border-dashed border-border text-muted-foreground hover:bg-muted transition-colors cursor-pointer justify-center")}
      >
        No label
      </button>
    );
  }

  // Candidates quick-view for tooltip (used when not yet annotated)
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
    </div>
  );

  // Timestamp tooltip for annotated/auto-confirmed
  const annotatedTooltip = (
    <div className="space-y-0.5">
      <p className="font-semibold text-[11px]">{displayLabel}</p>
      {isHuman && label.annotated_by && (
        <p className="text-muted-foreground text-[10px]">Annotated by: {label.annotated_by}</p>
      )}
      {isAutoConfirmed && !isHuman && (
        <p className="text-muted-foreground text-[10px]">Auto-confirmed by system</p>
      )}
      {label.annotated_at && (
        <p className="text-muted-foreground text-[10px]">{new Date(label.annotated_at).toLocaleString()}</p>
      )}
      <p className="text-muted-foreground text-[10px]">Relevance: {relevance}%</p>
    </div>
  );

  // Auto-confirmed badge — neutral colors, AI tag, relevance score
  if (isAutoConfirmed) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div onClick={onClick} className={cn(BADGE_BASE, "border-border bg-muted/40 text-foreground cursor-pointer")}>
              <div className="flex items-center gap-1.5 w-full">
                <span className={cn(TAG_BASE, "text-muted-foreground bg-muted")}>AI</span>
                <span className="truncate font-medium text-left">{displayLabel}</span>
              </div>
              <span className="text-[9px] text-muted-foreground pl-[26px]">Auto Confirmed · {relevance}%</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px] text-xs p-2.5">
            {annotatedTooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Human-annotated badge — same neutral style as AI, with lock icon as text
  if (isHuman) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div onClick={onClick} className={cn(BADGE_BASE, "border-border bg-muted/40 text-foreground cursor-pointer")}>
              <div className="flex items-center gap-1.5 w-full">
                <span className={cn(TAG_BASE, "text-muted-foreground bg-muted")}>HU</span>
                <span className="truncate font-medium text-left">{displayLabel}</span>
                <span className="text-[9px] ml-auto shrink-0 text-muted-foreground">🔒</span>
              </div>
              <span className="text-[9px] text-muted-foreground pl-[26px]">Human Annotation</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px] text-xs p-2.5">
            {annotatedTooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Pending AI badge — neutral, shows countdown + hover shows top 3 candidates
  const timerColor = hoursLeft < 1 ? "text-destructive" : hoursLeft < 6 ? "text-warning" : "text-muted-foreground";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(BADGE_BASE, "bg-background text-foreground border-border hover:bg-muted/40 transition-colors cursor-pointer")}
          >
            <div className="flex items-center gap-1.5 w-full">
              <span className={cn(TAG_BASE, "text-muted-foreground bg-muted")}>AI</span>
              <span className="truncate font-medium text-left">{displayLabel}</span>
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

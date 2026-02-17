import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AILabel, TBC_OPTIONS } from "@/types/hazard";
import AIBadge from "./AIBadge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Lock, Timer } from "lucide-react";

interface AnnotationPopoverProps {
  label: AILabel;
  fieldName?: string; // "TBC" | "PSPP" | "GR"
  options?: string[];
  onApply: (humanLabel: string, note: string) => void;
  slaDeadline?: string;
  onOpenChange?: (open: boolean) => void;
}

const SLA_DURATION_MS = 60_000;

type SelectionMode = "candidate" | "other" | null;

const AnnotationPopover = ({ label, fieldName = "TBC", options, onApply, slaDeadline, onOpenChange }: AnnotationPopoverProps) => {
  const [open, setOpenState] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [otherLabel, setOtherLabel] = useState("");
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [progress, setProgress] = useState(100);
  const [timeLeftText, setTimeLeftText] = useState("");
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [autoLocked, setAutoLocked] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  const setOpen = (v: boolean) => {
    setOpenState(v);
    onOpenChange?.(v);
  };

  const isLocked = label.locked || label.auto_confirmed || autoLocked;
  const candidates = label.candidates.slice(0, 3);
  const allOptions = options || TBC_OPTIONS;
  const relevance = candidates[0]?.relevance ?? 0;

  // SLA timer + auto-confirm on expiry
  useEffect(() => {
    if (label.locked || label.auto_confirmed) return;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const tick = () => {
      const remaining = Math.max(0, SLA_DURATION_MS - (Date.now() - startTime));
      setProgress((remaining / SLA_DURATION_MS) * 100);
      const secs = Math.ceil(remaining / 1000);
      setTimeLeftText(`${Math.floor(secs / 60)}m ${(secs % 60).toString().padStart(2, "0")}s`);
      if (remaining <= 0) {
        if (intervalId) clearInterval(intervalId);
        // Auto-confirm with candidate 1
        if (!autoLocked && candidates[0]) {
          setAutoLocked(true);
          onApply(candidates[0].label, "Auto-confirmed: SLA expired");
          setOpen(false);
          toast.info("SLA expired — auto-confirmed with top AI prediction");
        }
      }
    };
    tick();
    intervalId = setInterval(tick, 1000);
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [startTime, label.locked, label.auto_confirmed, autoLocked, candidates, onApply]);

  const computePosition = useCallback(() => {
    if (!badgeRef.current) return;
    const rect = badgeRef.current.getBoundingClientRect();
    const popoverWidth = 640;
    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - popoverWidth - 16);
    }
    setPopoverStyle({
      position: "fixed" as const,
      top: rect.bottom + 8,
      left,
      zIndex: 60,
    });
  }, []);

  const handleOpen = () => {
    setSelectedIndex(null);
    setOtherLabel("");
    setSelectionMode(null);
    setReason("");
    computePosition();
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleCandidateClick = useCallback((i: number) => {
    if (isLocked) return;
    if (selectionMode === "other") return;
    // Candidate 1 (i===0) is not selectable as override — it's the default
    if (i === 0) return;
    if (selectedIndex === i) {
      setSelectedIndex(null);
      setSelectionMode(null);
    } else {
      setSelectedIndex(i);
      setSelectionMode("candidate");
    }
  }, [isLocked, selectionMode, selectedIndex]);

  const handleOtherSelect = (value: string) => {
    if (isLocked) return;
    setOtherLabel(value);
    setSelectionMode("other");
    setSelectedIndex(null);
  };

  const clearOther = () => {
    setOtherLabel("");
    setSelectionMode(null);
  };

  const selectedLabel = selectionMode === "candidate" && selectedIndex !== null
    ? candidates[selectedIndex]?.label
    : selectionMode === "other" && otherLabel
      ? otherLabel
      : null;

  // Notes only required when override is selected (candidate 2/3 or other)
  const hasOverride = selectionMode !== null;
  const canConfirm = selectedLabel !== null && reason.trim().length > 0;

  const handleConfirm = () => {
    if (selectedLabel) onApply(selectedLabel, reason);
    setConfirmOpen(false);
    setOpen(false);
    toast.success("Annotation locked");
  };

  const urgencyColor = progress < 15 ? "text-destructive" : progress < 40 ? "text-warning" : "text-muted-foreground";
  const barColor = progress < 15 ? "bg-destructive" : progress < 40 ? "bg-warning" : "bg-primary";

  const candidateDisabled = selectionMode === "other";
  const otherDisabled = selectionMode === "candidate";

  const otherSectionLabel = `Other ${fieldName}`;
  const otherPlaceholder = `Select Other ${fieldName}`;

  return (
    <>
      <div className="relative inline-block" ref={badgeRef}>
        <div onClick={open ? handleClose : handleOpen} className="cursor-pointer">
          <AIBadge label={label} slaDeadline={slaDeadline} />
        </div>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-[55]" onClick={handleClose} />
          <div
            className="w-[640px] rounded-lg border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
            style={popoverStyle}
          >
            {isLocked && label.annotated_by && (
              <div className="px-3 py-2 bg-muted/50 border-b border-border flex items-center gap-2 text-[11px] text-muted-foreground rounded-t-lg">
                <Lock className="w-3 h-3 shrink-0" />
                <span>Locked by <strong>{label.annotated_by}</strong> · {label.annotated_at ? new Date(label.annotated_at).toLocaleString() : "N/A"}</span>
              </div>
            )}

            {!isLocked ? (
              <div className="flex divide-x divide-border">
                {/* LEFT: AI Candidates + Other */}
                <div className="flex-1 p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-foreground">AI Candidates</h4>
                  <div className="space-y-1.5">
                    {candidates.map((c, i) => {
                      const isTop = i === 0;
                      const isSelected = selectionMode === "candidate" && selectedIndex === i;
                      const isDimmed = isTop
                        ? selectionMode !== null
                        : candidateDisabled || (selectionMode === "candidate" && selectedIndex !== null && selectedIndex !== i);

                      return (
                        <TooltipProvider key={i} delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "flex items-center gap-2 p-2 rounded border transition-colors",
                                  isTop && selectionMode === null && "bg-primary/[0.06] border-primary/20",
                                  isDimmed ? "cursor-default border-border bg-muted/30 opacity-50" :
                                  isSelected ? "bg-primary/8 border-primary/30 cursor-pointer" :
                                  !isTop ? "border-border hover:bg-muted/40 cursor-pointer" : ""
                                )}
                                onClick={() => !isTop && !isDimmed && handleCandidateClick(i)}
                              >
                                <span className="text-[10px] font-bold text-muted-foreground w-4 shrink-0 text-center">{i + 1}</span>
                                {!isTop && !candidateDisabled ? (
                                  <div
                                    className={cn(
                                      "w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                                      isSelected ? "border-primary bg-primary" : "border-muted-foreground/40",
                                      isDimmed && "opacity-40"
                                    )}
                                  >
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                ) : (
                                  <div className="w-3.5 shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] font-medium text-foreground truncate">{c.label}</span>
                                    <span className={cn("text-[10px] font-semibold shrink-0", c.relevance >= 70 ? "text-status-complete" : c.relevance >= 50 ? "text-foreground" : "text-destructive")}>
                                      {c.relevance}%
                                    </span>
                                  </div>
                                  <Progress value={c.relevance} className="h-1 mt-1" />
                                  {isTop && (
                                    <span className="text-[9px] text-primary/70 mt-0.5 block font-medium">Top AI Prediction</span>
                                  )}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-[280px] text-[11px] p-3 leading-relaxed">
                              <p className="font-semibold mb-1">AI Reasoning</p>
                              <p className="text-muted-foreground">{c.reasoning}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>

                  {/* Other section */}
                  <div className={cn("pt-2 border-t border-border", otherDisabled && "opacity-50")}>
                    <label className="text-[11px] font-semibold text-foreground mb-1 block">{otherSectionLabel}</label>
                    <Select
                      value={otherLabel}
                      onValueChange={handleOtherSelect}
                      disabled={otherDisabled}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder={otherPlaceholder} />
                      </SelectTrigger>
                      <SelectContent className="z-[70] max-h-[240px]">
                        {allOptions.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-xs">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectionMode === "other" && otherLabel && (
                      <button onClick={clearOther} className="text-[9px] text-destructive hover:underline mt-1">
                        Clear selection
                      </button>
                    )}
                  </div>
                </div>

                {/* RIGHT: Human Annotation */}
                <div className="flex-1 p-3 space-y-2.5 flex flex-col">
                  <h4 className="text-xs font-semibold text-foreground">Human Annotation</h4>

                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">
                      Reason for override <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={hasOverride ? "Explain why you chose a different label." : "Select a candidate or other label first..."}
                      className={cn("text-xs min-h-[80px] resize-none", !hasOverride && "opacity-50 cursor-not-allowed")}
                      disabled={!hasOverride}
                    />
                  </div>

                  {/* SLA Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-[10px] flex items-center gap-1", urgencyColor)}>
                        <Timer className="w-3 h-3" />
                        Auto confirmation in {timeLeftText}
                      </p>
                      <span className={cn("text-[9px] font-mono", urgencyColor)}>{Math.round(progress)}%</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear", barColor)}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-1 mt-auto">
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleClose}>Cancel</Button>
                    <Button size="sm" className="text-xs h-7" onClick={() => canConfirm && setConfirmOpen(true)} disabled={!canConfirm}>
                      Confirm Annotation
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* LOCKED VIEW: show AI candidates + annotation history for traceability */
              <div className="flex divide-x divide-border">
                {/* LEFT: AI Candidates (read-only) */}
                <div className="flex-1 p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-foreground">AI Candidates</h4>
                  <div className="space-y-1.5">
                    {candidates.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded border border-border bg-muted/20">
                        <span className="text-[10px] font-bold text-muted-foreground w-4 shrink-0 text-center">{i + 1}</span>
                        <div className="w-3.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-medium text-foreground truncate">{c.label}</span>
                            <span className={cn("text-[10px] font-semibold shrink-0", c.relevance >= 70 ? "text-status-complete" : c.relevance >= 50 ? "text-foreground" : "text-destructive")}>
                              {c.relevance}%
                            </span>
                          </div>
                          <Progress value={c.relevance} className="h-1 mt-1" />
                          {i === 0 && (
                            <span className="text-[9px] text-muted-foreground mt-0.5 block">Top AI Prediction</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: Annotation History */}
                <div className="flex-1 p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-foreground">Annotation History</h4>
                  <div className="text-[11px] space-y-1.5 bg-muted/30 rounded p-2.5 border border-border">
                    {label.human_label && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Final Label</span>
                          <span className="font-medium text-foreground">{label.human_label}</span>
                        </div>
                        {label.annotated_by && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Annotated by</span>
                            <span className="font-medium text-foreground">{label.annotated_by}</span>
                          </div>
                        )}
                        {label.annotated_at && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Timestamp</span>
                            <span className="text-foreground">{new Date(label.annotated_at).toLocaleString()}</span>
                          </div>
                        )}
                        {label.annotation_note && (
                          <div className="pt-1 border-t border-border">
                            <span className="text-muted-foreground block mb-0.5">Note</span>
                            <p className="text-foreground italic">"{label.annotation_note}"</p>
                          </div>
                        )}
                      </>
                    )}
                    {label.auto_confirmed && !label.human_label && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Final Label</span>
                          <span className="font-medium text-foreground">{label.ai_label}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Method</span>
                          <span className="text-foreground">Auto-confirmed by system</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Relevance</span>
                          <span className="text-foreground">{relevance}%</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm human annotation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will <strong>LOCK</strong> the label to "<strong>{selectedLabel}</strong>". This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Lock Annotation</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AnnotationPopover;

import { useState } from "react";
import { X, ZoomIn, Lock, User } from "lucide-react";
import { HazardTask, AILabel } from "@/types/hazard";
import StatusBadge from "./StatusBadge";
import { Progress } from "@/components/ui/progress";

interface TaskDrawerProps {
  task: HazardTask;
  open: boolean;
  onClose: () => void;
  onUpdateTask: (task: HazardTask) => void;
  onSubmit: (taskId: string) => void;
}

const TaskDrawer = ({ task, open, onClose }: TaskDrawerProps) => {
  const [imageZoomed, setImageZoomed] = useState(false);

  if (!open) return null;

  const tbcCandidates = task.tbc.candidates.slice(0, 2);

  return (
    <>
      <div className="fixed left-0 top-0 bottom-0 w-[460px] bg-card z-50 shadow-2xl animate-slide-in-left flex flex-col border-r border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Task #{task.id}</span>
              <StatusBadge status={task.status} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {task.pic_perusahaan} · {task.timestamp}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Image */}
          <div className="relative group cursor-pointer" onClick={() => setImageZoomed(!imageZoomed)}>
            <img
              src={task.image_url}
              alt="Hazard evidence"
              className={`w-full rounded-lg object-cover transition-all ${imageZoomed ? "max-h-[400px]" : "max-h-[180px]"}`}
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors rounded-lg flex items-center justify-center">
              <ZoomIn className="w-5 h-5 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Task Info */}
          <section>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Task Details</h4>
            <div className="grid grid-cols-2 gap-2">
              <InfoRow label="Task ID" value={task.id} />
              <InfoRow label="Timestamp" value={task.timestamp} />
              <InfoRow label="PIC Perusahaan" value={task.pic_perusahaan} />
              <InfoRow label="Site" value={task.site} />
              <InfoRow label="Lokasi" value={task.lokasi} />
              <InfoRow label="Detail Location" value={task.detail_location} />
            </div>
          </section>

          {/* Description Block */}
          <section>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
            <p className="text-xs text-foreground leading-relaxed">{task.description}</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <InfoRow label="Ketidaksesuaian" value={task.ketidaksesuaian} />
              <InfoRow label="Sub Ketidaksesuaian" value={task.sub_ketidaksesuaian} />
            </div>
          </section>

          {/* AI TBC Candidates (Top 2) */}
          <section>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">AI TBC Candidates</h4>
            <div className="space-y-2">
              {tbcCandidates.map((c, i) => (
                <div key={i} className="p-2.5 rounded border border-border bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-foreground">{c.label}</span>
                    <span className="text-[10px] font-medium text-muted-foreground">{c.relevance}%</span>
                  </div>
                  <Progress value={c.relevance} className="h-1 mb-1" />
                  <p className="text-[10px] text-muted-foreground leading-tight">{c.reasoning}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Annotation History */}
          {(task.tbc.locked || task.pspp.locked || task.gr.locked) && (
            <section>
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Annotation History</h4>
              <div className="space-y-1.5">
                {task.tbc.locked && <AnnotationRow title="TBC" label={task.tbc} />}
                {task.pspp.locked && <AnnotationRow title="PSPP" label={task.pspp} />}
                {task.gr.locked && <AnnotationRow title="GR" label={task.gr} />}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border shrink-0">
          <p className="text-[10px] text-muted-foreground text-center">
            J/K to navigate · ESC to close
          </p>
        </div>
      </div>
    </>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
    <p className="text-xs text-foreground">{value}</p>
  </div>
);

const AnnotationRow = ({ title, label }: { title: string; label: AILabel }) => {
  const isAutoConfirmed = label.auto_confirmed;
  const displayLabel = label.human_label || label.ai_label;
  const relevance = label.candidates?.[0]?.relevance ?? 0;

  if (isAutoConfirmed) {
    return (
      <div className="p-2 rounded border border-border bg-muted/20">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
          <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1 rounded">AI</span>
          <span className="flex-1">{title}: {displayLabel}</span>
          <Lock className="w-3 h-3 text-primary shrink-0" />
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Confirmed by: System (AI Auto-Confirm) · Relevance: {relevance}%
        </p>
        {label.annotated_at && (
          <p className="text-[10px] text-muted-foreground">
            {new Date(label.annotated_at).toLocaleString()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="p-2 rounded border border-border bg-muted/20">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
        <User className="w-3 h-3 text-muted-foreground shrink-0" />
        <span className="flex-1">{title}: {displayLabel}</span>
        <Lock className="w-3 h-3 text-primary shrink-0" />
      </div>
      {label.annotated_by && (
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Annotated by {label.annotated_by} · {label.annotated_at ? new Date(label.annotated_at).toLocaleString() : ""}
        </p>
      )}
      {label.annotation_note && (
        <p className="text-[10px] text-muted-foreground italic mt-0.5">"{label.annotation_note}"</p>
      )}
    </div>
  );
};

export default TaskDrawer;

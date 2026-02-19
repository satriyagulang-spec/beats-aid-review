import { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowDownUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type LabelFilterValue = "all" | "auto_confirmed" | "human_annotated" | "waiting";
export type LabelSortValue = "relevance_desc" | "relevance_asc" | "sla_asc" | "sla_desc" | "newest" | "oldest";

interface LabelColumnHeaderProps {
  label: string;
  filter: LabelFilterValue;
  sort: LabelSortValue | null;
  onFilterChange: (v: LabelFilterValue) => void;
  onSortChange: (v: LabelSortValue | null) => void;
}

const FILTER_OPTIONS: { value: LabelFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "auto_confirmed", label: "Auto-confirmed (AI)" },
  { value: "human_annotated", label: "Annotated by Human" },
  { value: "waiting", label: "Waiting" },
];

const SORT_OPTIONS: { value: LabelSortValue; label: string }[] = [
  { value: "relevance_desc", label: "Relevance — Highest" },
  { value: "relevance_asc", label: "Relevance — Lowest" },
  { value: "sla_asc", label: "SLA — Most Urgent" },
  { value: "sla_desc", label: "SLA — Least Urgent" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

const FILTER_LABELS: Record<LabelFilterValue, string> = {
  all: "All",
  auto_confirmed: "AI",
  human_annotated: "Human",
  waiting: "Waiting",
};

export default function LabelColumnHeader({ label, filter, sort, onFilterChange, onSortChange }: LabelColumnHeaderProps) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilterMenu(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isFiltered = filter !== "all";
  const isSorted = sort !== null;

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-semibold">{label}</span>

      {/* Filter dropdown */}
      <div ref={filterRef} className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setShowFilterMenu(v => !v); setShowSortMenu(false); }}
          className={cn(
            "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors",
            isFiltered
              ? "bg-primary/15 text-primary border border-primary/20"
              : "bg-muted/80 text-muted-foreground hover:bg-muted border border-transparent"
          )}
        >
          {FILTER_LABELS[filter]}
          <ChevronDown className="w-2.5 h-2.5" />
        </button>
        {showFilterMenu && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={(e) => { e.stopPropagation(); onFilterChange(opt.value); setShowFilterMenu(false); }}
                className={cn(
                  "w-full text-left px-3 py-1.5 text-[11px] hover:bg-muted transition-colors",
                  filter === opt.value && "text-primary font-semibold bg-primary/5"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sort dropdown */}
      <div ref={sortRef} className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setShowSortMenu(v => !v); setShowFilterMenu(false); }}
          className={cn(
            "p-0.5 rounded transition-colors",
            isSorted
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          <ArrowDownUp className="w-3 h-3" />
        </button>
        {showSortMenu && (
          <div className="absolute top-full right-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[170px]">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={(e) => { e.stopPropagation(); onSortChange(sort === opt.value ? null : opt.value); setShowSortMenu(false); }}
                className={cn(
                  "w-full text-left px-3 py-1.5 text-[11px] hover:bg-muted transition-colors",
                  sort === opt.value && "text-primary font-semibold bg-primary/5"
                )}
              >
                {opt.label}
                {sort === opt.value && <span className="ml-1 text-[9px]">✓</span>}
              </button>
            ))}
            {isSorted && (
              <>
                <div className="border-t border-border my-1" />
                <button
                  onClick={(e) => { e.stopPropagation(); onSortChange(null); setShowSortMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1"
                >
                  <X className="w-2.5 h-2.5" /> Clear sort
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

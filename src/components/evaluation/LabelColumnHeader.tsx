import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, ArrowDownUp, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";

export type LabelFilterValue = "all" | "auto_confirmed" | "human_annotated" | "waiting";
export type LabelSortValue = "relevance_desc" | "relevance_asc" | "sla_asc" | "sla_desc";

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
  { value: "relevance_desc", label: "Highest Relevance" },
  { value: "relevance_asc", label: "Lowest Relevance" },
  { value: "sla_asc", label: "Most Urgent SLA" },
  { value: "sla_desc", label: "Least Urgent SLA" },
];

const FILTER_SHORT: Record<LabelFilterValue, string> = {
  all: "All",
  auto_confirmed: "AI",
  human_annotated: "Human",
  waiting: "Wait",
};

export default function LabelColumnHeader({ label, filter, sort, onFilterChange, onSortChange }: LabelColumnHeaderProps) {
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSort(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isFiltered = filter !== "all";
  const isSorted = sort !== null;

  return (
    <div className="flex items-center justify-between w-full gap-1.5">
      <span className="font-semibold text-[11px]">{label}</span>

      <div className="flex items-center gap-0.5 shrink-0">
        {/* Filter button */}
        <div ref={filterRef} className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowFilter(v => !v); setShowSort(false); }}
            className={cn(
              "inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-medium transition-colors border",
              isFiltered
                ? "bg-primary/10 text-primary border-primary/20"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <ListFilter className="w-2.5 h-2.5" />
            {FILTER_SHORT[filter]}
          </button>
          {showFilter && (
            <div className="absolute top-full right-0 mt-1 z-[60] bg-popover border border-border rounded-md shadow-lg py-0.5 w-[150px]">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={(e) => { e.stopPropagation(); onFilterChange(opt.value); setShowFilter(false); }}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 text-[10px] transition-colors",
                    filter === opt.value
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort button */}
        <div ref={sortRef} className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowSort(v => !v); setShowFilter(false); }}
            className={cn(
              "p-0.5 rounded transition-colors",
              isSorted
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <ArrowDownUp className="w-3 h-3" />
          </button>
          {showSort && (
            <div className="absolute top-full right-0 mt-1 z-[60] bg-popover border border-border rounded-md shadow-lg py-0.5 w-[155px]">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={(e) => { e.stopPropagation(); onSortChange(sort === opt.value ? null : opt.value); setShowSort(false); }}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 text-[10px] flex items-center gap-1.5 transition-colors",
                    sort === opt.value
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {sort === opt.value && <span className="text-[8px]">✓</span>}
                  {opt.label}
                </button>
              ))}
              {isSorted && (
                <>
                  <div className="h-px bg-border my-0.5" />
                  <button
                    onClick={(e) => { e.stopPropagation(); onSortChange(null); setShowSort(false); }}
                    className="w-full text-left px-2.5 py-1.5 text-[10px] text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Clear sort
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

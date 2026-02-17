import { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown, MapPin, Navigation, Compass, Tag, BarChart3, Clock, Layers, FolderTree } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ColumnFilters {
  site: string[];
  lokasi: string[];
  ketidaksesuaian: string[];
  sub_ketidaksesuaian: string[];
  tbc: string[];
  pspp: string[];
  gr: string[];
  confidence: string | null;
  timeRemaining: string | null;
}

export const emptyFilters: ColumnFilters = {
  site: [], lokasi: [], ketidaksesuaian: [], sub_ketidaksesuaian: [],
  tbc: [], pspp: [], gr: [],
  confidence: null, timeRemaining: null,
};

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: ColumnFilters;
  onFiltersChange: (filters: ColumnFilters) => void;
  filterOptions: {
    sites: string[];
    lokasi: string[];
    ketidaksesuaian: string[];
    sub_ketidaksesuaian: string[];
    tbcLabels: string[];
    psppLabels: string[];
    grLabels: string[];
  };
}

const FILTER_ICONS: Record<string, React.ReactNode> = {
  Site: <MapPin className="w-3 h-3" />,
  Lokasi: <Navigation className="w-3 h-3" />,
  Ketidaksesuaian: <Compass className="w-3 h-3" />,
  "Sub Ketidaksesuaian": <FolderTree className="w-3 h-3" />,
  TBC: <Tag className="w-3 h-3" />,
  PSPP: <Layers className="w-3 h-3" />,
  GR: <Tag className="w-3 h-3" />,
  Confidence: <BarChart3 className="w-3 h-3" />,
  "Time Left": <Clock className="w-3 h-3" />,
};

const FilterBar = ({ search, onSearchChange, filters, onFiltersChange, filterOptions }: FilterBarProps) => {
  const activeCount = [
    ...filters.site, ...filters.lokasi, ...filters.ketidaksesuaian, ...filters.sub_ketidaksesuaian,
    ...filters.tbc, ...filters.pspp, ...filters.gr,
  ].length + (filters.confidence ? 1 : 0) + (filters.timeRemaining ? 1 : 0);

  const clearAll = () => onFiltersChange(emptyFilters);

  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      <div className="relative shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Search Task ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 w-48 text-xs"
        />
      </div>
      <div className="flex items-center gap-1.5 flex-wrap flex-1">
        <MultiSelectFilter label="Site" icon={FILTER_ICONS.Site} options={filterOptions.sites} selected={filters.site}
          onChange={(v) => onFiltersChange({ ...filters, site: v })} />
        <MultiSelectFilter label="Lokasi" icon={FILTER_ICONS.Lokasi} options={filterOptions.lokasi} selected={filters.lokasi}
          onChange={(v) => onFiltersChange({ ...filters, lokasi: v })} />
        <MultiSelectFilter label="Ketidaksesuaian" icon={FILTER_ICONS.Ketidaksesuaian} options={filterOptions.ketidaksesuaian} selected={filters.ketidaksesuaian}
          onChange={(v) => onFiltersChange({ ...filters, ketidaksesuaian: v })} />
        <MultiSelectFilter label="Sub Ketidaksesuaian" icon={FILTER_ICONS["Sub Ketidaksesuaian"]} options={filterOptions.sub_ketidaksesuaian} selected={filters.sub_ketidaksesuaian}
          onChange={(v) => onFiltersChange({ ...filters, sub_ketidaksesuaian: v })} />
        <MultiSelectFilter label="TBC" icon={FILTER_ICONS.TBC} options={filterOptions.tbcLabels} selected={filters.tbc}
          onChange={(v) => onFiltersChange({ ...filters, tbc: v })} />
        <MultiSelectFilter label="PSPP" icon={FILTER_ICONS.PSPP} options={filterOptions.psppLabels} selected={filters.pspp}
          onChange={(v) => onFiltersChange({ ...filters, pspp: v })} />
        <MultiSelectFilter label="GR" icon={FILTER_ICONS.GR} options={filterOptions.grLabels} selected={filters.gr}
          onChange={(v) => onFiltersChange({ ...filters, gr: v })} />
        <SingleSelectFilter label="Confidence" icon={FILTER_ICONS.Confidence} options={[
          { value: "0-50", label: "0–50%" },
          { value: "50-70", label: "50–70%" },
          { value: "70-100", label: "70–100%" },
        ]} selected={filters.confidence} onChange={(v) => onFiltersChange({ ...filters, confidence: v })} />
        <SingleSelectFilter label="Time Left" icon={FILTER_ICONS["Time Left"]} options={[
          { value: "<6h", label: "< 6 hours" },
          { value: "<24h", label: "< 24 hours" },
          { value: ">24h", label: "> 24 hours" },
        ]} selected={filters.timeRemaining} onChange={(v) => onFiltersChange({ ...filters, timeRemaining: v })} />
        {activeCount > 0 && (
          <button onClick={clearAll} className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] text-destructive hover:text-destructive/80 transition-colors">
            <X className="w-3 h-3" /> Clear ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
};

// Multi-select dropdown filter
function MultiSelectFilter({ label, icon, options, selected, onChange }: {
  label: string; icon?: React.ReactNode; options: string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (v: string) => {
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);
  };

  const hasSelected = selected.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[11px] font-medium transition-colors",
          hasSelected ? "border-primary/30 bg-primary/5 text-primary" : "border-border text-foreground hover:bg-muted"
        )}
      >
        {icon}
        {label}{hasSelected && ` (${selected.length})`}
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-md shadow-md w-52 max-h-56 overflow-auto py-1">
          {options.length === 0 && <p className="px-3 py-2 text-[11px] text-muted-foreground">No options</p>}
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 px-3 py-1.5 text-[11px] hover:bg-muted/50 cursor-pointer">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="accent-primary w-3 h-3" />
              <span className="truncate">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// Single-select dropdown filter
function SingleSelectFilter({ label, icon, options, selected, onChange }: {
  label: string; icon?: React.ReactNode; options: { value: string; label: string }[]; selected: string | null; onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[11px] font-medium transition-colors",
          selected ? "border-primary/30 bg-primary/5 text-primary" : "border-border text-foreground hover:bg-muted"
        )}
      >
        {icon}
        {label}{selected && `: ${options.find(o => o.value === selected)?.label}`}
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-md shadow-md w-40 py-1">
          <button onClick={() => { onChange(null); setOpen(false); }}
            className={cn("w-full text-left px-3 py-1.5 text-[11px] hover:bg-muted/50", !selected && "font-medium text-primary")}>
            All
          </button>
          {options.map((opt) => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn("w-full text-left px-3 py-1.5 text-[11px] hover:bg-muted/50", selected === opt.value && "font-medium text-primary")}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterBar;

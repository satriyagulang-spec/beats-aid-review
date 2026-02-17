import { RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Navbar = () => {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-foreground leading-tight">
            BEATS Hazard Reporting System
            <span className="ml-2 text-xs font-normal text-muted-foreground">Evaluator Dashboard v2.0</span>
          </h1>
          <p className="text-xs text-muted-foreground">AI-Powered Safety Analysis & Evaluation</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={() => toast.info("Syncing hazards...")}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Hazards
        </Button>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs font-medium text-foreground leading-tight">FAUZAN AJI</p>
            <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">
              Evaluator
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

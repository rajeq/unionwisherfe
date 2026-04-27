import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "primary" | "gold" | "success";
  loading?: boolean;
}

export function StatCard({ label, value, icon: Icon, accent = "primary", loading }: Props) {
  const accentMap = {
    primary: "text-secondary",
    gold: "text-gold",
    success: "text-success",
  };
  const bgMap = {
    primary: "from-secondary/20",
    gold: "from-gold/20",
    success: "from-success/20",
  };

  return (
    <div className="glass rounded-2xl p-5 hover-lift relative overflow-hidden">
      <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent opacity-50", bgMap[accent])} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
          {loading ? (
            <div className="h-9 w-20 mt-2 rounded-md skeleton" />
          ) : (
            <div className="text-3xl lg:text-4xl font-bold mt-1.5 tabular-nums">{value}</div>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-xl glass-strong flex items-center justify-center", accentMap[accent])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

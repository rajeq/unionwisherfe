import { Cake, Heart, Mail, Phone, Building2, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Employee, maskPhone, sendWish } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface Props {
  employee: Employee;
  defaultType?: "birthday" | "anniversary";
}

export function EmployeeCard({ employee, defaultType }: Props) {
  const type = employee.type ?? defaultType ?? "birthday";
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      await sendWish({
        name: employee.name,
        phone: employee.phone,
        email: employee.email,
        union: employee.union,
        type,
      });
      toast.success(`Wish sent to ${employee.name} 🎉`);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#FFD700", "#1E90FF", "#0A3D62"],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send wish";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const Icon = type === "birthday" ? Cake : Heart;
  const accentClass = type === "birthday" ? "text-gold" : "text-secondary";

  return (
    <div className="glass rounded-2xl p-5 hover-lift relative overflow-hidden group">
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity gradient-primary blur-2xl" />

      <div className="flex items-start gap-3 relative">
        <div className={`w-11 h-11 rounded-xl glass-strong flex items-center justify-center ${accentClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold truncate">{employee.name}</h3>
            <Badge
              variant="outline"
              className={type === "birthday" ? "border-gold/40 text-gold" : "border-secondary/40 text-secondary"}
            >
              {type === "birthday" ? "Birthday" : "Anniversary"}
            </Badge>
          </div>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><Building2 className="w-3 h-3" />{employee.union || "—"}</div>
            <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{maskPhone(employee.phone)}</div>
            <div className="flex items-center gap-2 truncate"><Mail className="w-3 h-3 shrink-0" /><span className="truncate">{employee.email || "—"}</span></div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSend}
        disabled={loading}
        className="w-full mt-4 gradient-primary text-primary-foreground border-0 shadow-glow hover:opacity-95"
      >
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
        {loading ? "Sending..." : "Send Wish"}
      </Button>
    </div>
  );
}

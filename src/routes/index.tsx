import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Cake, Heart, Users, Search, Send, Loader2, Filter } from "lucide-react";
import {
  Employee, fetchAnniversariesToday, fetchBirthdaysToday, fetchEmployees, sendWish,
} from "@/lib/api";
import { useApp } from "@/contexts/AppContext";
import { StatCard } from "@/components/StatCard";
import { EmployeeCard } from "@/components/EmployeeCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const REFRESH_MS = 60_000;

function Dashboard() {
  const { union } = useApp();
  const [birthdays, setBirthdays] = useState<Employee[]>([]);
  const [anniversaries, setAnniversaries] = useState<Employee[]>([]);
  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "birthday" | "anniversary">("all");

  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [b, a, all] = await Promise.allSettled([
        fetchBirthdaysToday(union),
        fetchAnniversariesToday(union),
        fetchEmployees(union),
      ]);
      if (b.status === "fulfilled") setBirthdays(b.value); else setBirthdays([]);
      if (a.status === "fulfilled") setAnniversaries(a.value); else setAnniversaries([]);
      if (all.status === "fulfilled") setTotalEmployees(all.value.length); else setTotalEmployees(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [union]);

  const combined = useMemo(() => {
    let list: Employee[] = [];
    if (typeFilter === "all" || typeFilter === "birthday")
      list = list.concat(birthdays.map((e) => ({ ...e, type: "birthday" as const })));
    if (typeFilter === "all" || typeFilter === "anniversary")
      list = list.concat(anniversaries.map((e) => ({ ...e, type: "anniversary" as const })));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) =>
        [e.name, e.email, e.union, e.phone].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return list;
  }, [birthdays, anniversaries, search, typeFilter]);

  const handleBulkSend = async () => {
    if (combined.length === 0) {
      toast.info("No recipients to send.");
      return;
    }
    setBulkSending(true);
    setBulkProgress({ done: 0, total: combined.length });
    let success = 0; let failed = 0;
    for (let i = 0; i < combined.length; i++) {
      const e = combined[i];
      try {
        await sendWish({
          name: e.name, phone: e.phone, email: e.email, union: e.union,
          type: (e.type ?? "birthday") as "birthday" | "anniversary",
        });
        success++;
      } catch {
        failed++;
      }
      setBulkProgress({ done: i + 1, total: combined.length });
      if (i < combined.length - 1) await new Promise((r) => setTimeout(r, 2000));
    }
    setBulkSending(false);
    if (success) {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ["#FFD700", "#1E90FF", "#0A3D62"] });
      toast.success(`Sent ${success} wish${success > 1 ? "es" : ""}${failed ? `, ${failed} failed` : ""}.`);
    } else {
      toast.error(`Failed to send wishes (${failed} errors).`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="glass-strong rounded-2xl p-6 lg:p-8 shadow-card relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full gradient-primary opacity-20 blur-3xl animate-float" />
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.25em] text-gradient-gold font-semibold">UnionWisher</div>
          <h1 className="text-2xl lg:text-4xl font-bold mt-2">
            <span className="text-gradient-primary">Admin Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Automate Wishes. Strengthen Connections. Live view of today's celebrations across {union === "All" ? "all unions" : union}.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Birthdays Today" value={birthdays.length} icon={Cake} accent="gold" loading={loading} />
        <StatCard label="Anniversaries Today" value={anniversaries.length} icon={Heart} accent="primary" loading={loading} />
        <StatCard label="Total Employees" value={totalEmployees} icon={Users} accent="success" loading={loading} />
      </section>

      {/* Controls */}
      <section className="glass rounded-2xl p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone…"
            className="pl-9 bg-glass border-glass-border"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
            <SelectTrigger className="w-[160px] glass border-glass-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="birthday">Birthdays</SelectItem>
              <SelectItem value="anniversary">Anniversaries</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleBulkSend}
            disabled={bulkSending || combined.length === 0}
            className="gradient-gold text-gold-foreground border-0 shadow-glow font-semibold"
          >
            {bulkSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            {bulkSending ? `Sending ${bulkProgress.done}/${bulkProgress.total}` : "Send Wishes to All"}
          </Button>
        </div>
      </section>

      {bulkSending && (
        <div className="glass rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Bulk progress</span>
            <span>{bulkProgress.done} / {bulkProgress.total}</span>
          </div>
          <Progress value={(bulkProgress.done / Math.max(1, bulkProgress.total)) * 100} />
        </div>
      )}

      {/* Tiles */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Today's Celebrations</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : combined.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            No celebrations today for {union === "All" ? "any union" : union}.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {combined.map((e, i) => (
              <EmployeeCard key={`${e.email || e.phone || e.name}-${i}`} employee={e} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

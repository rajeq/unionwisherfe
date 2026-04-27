import { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Users, Upload, Image as ImageIcon, Sparkles, Moon, Sun, Building2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { UNIONS } from "@/lib/api";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/upload", label: "Upload Data", icon: Upload },
  { to: "/templates", label: "Templates", icon: ImageIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { union, setUnion, theme, toggleTheme } = useApp();
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col glass-strong border-r border-glass-border p-5 gap-2 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-3 mb-6 group">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight text-gradient-primary">UnionWisher</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin Console</div>
          </div>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-glass"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto glass rounded-xl p-4 text-xs text-muted-foreground">
          <div className="text-gradient-gold font-semibold mb-1">UnionWisher</div>
          Automate Wishes. Strengthen Connections.
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 glass-strong border-b border-glass-border">
          <div className="flex items-center gap-3 px-4 lg:px-8 py-3">
            <Link to="/" className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-gradient-primary">UnionWisher</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 ml-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Union</span>
            </div>
            <Select value={union} onValueChange={(v) => setUnion(v as typeof union)}>
              <SelectTrigger className="w-[160px] glass border-glass-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Unions</SelectItem>
                {UNIONS.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="lg:hidden flex gap-1 px-2 pb-2 overflow-x-auto">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all",
                    active ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:bg-glass"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Employee, UNIONS, createEmployee, deleteEmployee, fetchEmployees, updateEmployee, maskPhone,
} from "@/lib/api";
import { useApp } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/employees")({ component: EmployeesPage });

function emptyEmployee(union: string): Employee {
  return { name: "", phone: "", email: "", union: union === "All" ? "Union A" : union, dob: "", joiningDate: "" };
}

function EmployeesPage() {
  const { union } = useApp();
  const [list, setList] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<Employee>(emptyEmployee(union));
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchEmployees(union);
      setList(data);
    } catch {
      setList([]);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [union]);

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((e) =>
      [e.name, e.email, e.phone, e.union].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [list, search]);

  const startAdd = () => {
    setEditing(null);
    setForm(emptyEmployee(union));
    setOpen(true);
  };

  const startEdit = (e: Employee) => {
    setEditing(e);
    setForm({ ...e });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.email || !form.union) {
      toast.error("Please fill name, phone, email and union.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const id = (editing.id ?? editing._id) as string;
        await updateEmployee(id, form);
        toast.success("Employee updated");
      } else {
        await createEmployee(form);
        toast.success("Employee added");
      }
      setOpen(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e: Employee) => {
    const id = (e.id ?? e._id) as string;
    if (!id) return;
    if (!confirm(`Delete ${e.name}?`)) return;
    try {
      await deleteEmployee(id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const headers = ["name", "phone", "email", "union", "dob", "joiningDate"];
    const rows = filtered.map((e) =>
      headers.map((h) => `"${String((e as any)[h] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `employees-${union.toLowerCase().replace(/\s/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gradient-primary">Employees</h1>
          <p className="text-muted-foreground text-sm">
            Manage employee records {union !== "All" && <>· filtered by <span className="text-foreground">{union}</span></>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} className="border-glass-border">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={startAdd} className="gradient-primary text-primary-foreground shadow-glow border-0">
                <Plus className="w-4 h-4 mr-2" /> Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-glass-border">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Employee" : "Add Employee"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Name *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                <Field label="Phone *"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
                <Field label="Email *" wide><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                <Field label="Union *">
                  <Select value={form.union} onValueChange={(v) => setForm({ ...form, union: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {UNIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="DOB"><Input type="date" value={form.dob ?? ""} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></Field>
                <Field label="Joining Date"><Input type="date" value={form.joiningDate ?? ""} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} /></Field>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground border-0">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editing ? "Save Changes" : "Add Employee"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees…" className="pl-9 bg-glass border-glass-border" />
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-glass">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Union</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-glass-border">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 w-24 rounded skeleton" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No employees found.</td></tr>
              ) : (
                filtered.map((e, i) => (
                  <tr key={(e.id ?? e._id ?? i) as React.Key} className="border-t border-glass-border hover:bg-glass">
                    <td className="px-4 py-3 font-medium">{e.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.union}</td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{maskPhone(e.phone)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.dob ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.joiningDate ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(e)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(e)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

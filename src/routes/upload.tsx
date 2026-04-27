import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  Employee, UNIONS, uploadCsv, uploadExcel, uploadJson,
} from "@/lib/api";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileJson, FileSpreadsheet, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/upload")({ component: UploadPage });

type Row = Partial<Employee> & Record<string, unknown>;

function normalize(row: Record<string, unknown>): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(row)) {
    const key = k.trim().toLowerCase().replace(/\s+/g, "");
    if (key === "name" || key === "fullname") out.name = String(v ?? "");
    else if (key === "phone" || key === "mobile" || key === "phonenumber") out.phone = String(v ?? "");
    else if (key === "email" || key === "emailid") out.email = String(v ?? "");
    else if (key === "union") out.union = String(v ?? "");
    else if (key === "dob" || key === "birthday" || key === "dateofbirth") out.dob = String(v ?? "");
    else if (key === "joiningdate" || key === "doj" || key === "dateofjoining") out.joiningDate = String(v ?? "");
    else (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

const isValidEmail = (e?: string) => !!e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPhone = (p?: string) => !!p && /^\+?[\d\s-]{7,15}$/.test(p);

function UploadPage() {
  const { union } = useApp();
  const [overrideUnion, setOverrideUnion] = useState<string>(union === "All" ? "Union A" : union);
  const [rows, setRows] = useState<Row[]>([]);
  const [source, setSource] = useState<"json" | "csv" | "excel" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const handleFile = async (file: File, kind: "json" | "csv" | "excel") => {
    setSource(kind);
    setFileName(file.name);
    try {
      if (kind === "json") {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const arr = Array.isArray(parsed) ? parsed : parsed?.data ?? [];
        setRows(arr.map(normalize));
      } else if (kind === "csv") {
        Papa.parse(file, {
          header: true, skipEmptyLines: true,
          complete: (res) => setRows((res.data as Record<string, unknown>[]).map(normalize)),
          error: () => toast.error("Failed to parse CSV"),
        });
      } else {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
        setRows(json.map(normalize));
      }
      toast.success("File parsed. Review and confirm upload.");
    } catch {
      toast.error("Failed to parse file");
    }
  };

  const applyUnion = () => {
    setRows((rs) => rs.map((r) => ({ ...r, union: r.union || overrideUnion })));
    toast.info(`Filled missing unions with ${overrideUnion}`);
  };

  const validation = rows.map((r) => ({
    emailOk: isValidEmail(r.email as string),
    phoneOk: isValidPhone(r.phone as string),
  }));
  const invalidCount = validation.filter((v) => !v.emailOk || !v.phoneOk).length;

  const handleConfirm = async (file?: File) => {
    if (rows.length === 0) return toast.error("No rows to upload");
    setUploading(true);
    try {
      const payload = rows.map((r) => ({ ...r, union: r.union || overrideUnion }));
      if (source === "json") {
        await uploadJson(payload);
      } else if (file && source === "csv") {
        await uploadCsv(file);
      } else if (file && source === "excel") {
        await uploadExcel(file);
      } else {
        await uploadJson(payload);
      }
      toast.success(`Uploaded ${payload.length} records.`);
      setRows([]); setFileName("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gradient-primary">Upload Employee Data</h1>
        <p className="text-muted-foreground text-sm mt-1">JSON, CSV or Excel — preview and confirm.</p>
      </div>

      <div className="glass rounded-2xl p-5 flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="space-y-1.5 flex-1">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Default Union for missing rows</Label>
          <Select value={overrideUnion} onValueChange={setOverrideUnion}>
            <SelectTrigger className="bg-glass border-glass-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              {UNIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={applyUnion} disabled={rows.length === 0} className="border-glass-border">
          Apply to all rows
        </Button>
      </div>

      <Tabs defaultValue="csv" className="space-y-4">
        <TabsList className="glass border border-glass-border">
          <TabsTrigger value="csv"><FileText className="w-4 h-4 mr-2" />CSV</TabsTrigger>
          <TabsTrigger value="excel"><FileSpreadsheet className="w-4 h-4 mr-2" />Excel</TabsTrigger>
          <TabsTrigger value="json"><FileJson className="w-4 h-4 mr-2" />JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="csv"><Dropzone accept=".csv,text/csv" onFile={(f) => handleFile(f, "csv")} kind="CSV" /></TabsContent>
        <TabsContent value="excel"><Dropzone accept=".xls,.xlsx" onFile={(f) => handleFile(f, "excel")} kind="Excel" /></TabsContent>
        <TabsContent value="json"><Dropzone accept=".json,application/json" onFile={(f) => handleFile(f, "json")} kind="JSON" /></TabsContent>
      </Tabs>

      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{rows.length}</span> rows from <span className="text-foreground">{fileName}</span>
              {invalidCount > 0 && (
                <span className="ml-3 inline-flex items-center gap-1 text-destructive">
                  <AlertCircle className="w-3.5 h-3.5" /> {invalidCount} validation issue{invalidCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <Button onClick={() => handleConfirm()} disabled={uploading} className="gradient-primary text-primary-foreground border-0 shadow-glow">
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Confirm Upload
            </Button>
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-glass sticky top-0">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Union</th>
                    <th className="px-4 py-3">DOB</th>
                    <th className="px-4 py-3">Joining</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 200).map((r, i) => {
                    const v = validation[i];
                    const ok = v.emailOk && v.phoneOk;
                    return (
                      <tr key={i} className="border-t border-glass-border">
                        <td className="px-4 py-2 text-muted-foreground tabular-nums">{i + 1}</td>
                        <td className="px-4 py-2">{r.name as string}</td>
                        <td className={"px-4 py-2 tabular-nums " + (v.phoneOk ? "" : "text-destructive")}>{r.phone as string}</td>
                        <td className={"px-4 py-2 " + (v.emailOk ? "" : "text-destructive")}>{r.email as string}</td>
                        <td className="px-4 py-2 text-muted-foreground">{(r.union as string) || <span className="italic">{overrideUnion}</span>}</td>
                        <td className="px-4 py-2 text-muted-foreground">{(r.dob as string) ?? "—"}</td>
                        <td className="px-4 py-2 text-muted-foreground">{(r.joiningDate as string) ?? "—"}</td>
                        <td className="px-4 py-2">
                          {ok ? <span className="text-success text-xs">Valid</span> : <span className="text-destructive text-xs">Invalid</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {rows.length > 200 && (
              <div className="text-center text-xs text-muted-foreground p-3 border-t border-glass-border">
                Showing first 200 of {rows.length} rows
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Dropzone({ accept, onFile, kind }: { accept: string; onFile: (f: File) => void; kind: string }) {
  const [drag, setDrag] = useState(false);
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files?.[0]; if (f) onFile(f);
      }}
      className={
        "glass rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed transition-all " +
        (drag ? "border-secondary bg-secondary/10 shadow-glow" : "border-glass-border hover:border-secondary/50")
      }
    >
      <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow mb-4">
        <Upload className="w-6 h-6 text-primary-foreground" />
      </div>
      <div className="font-semibold">Drop your {kind} file here</div>
      <div className="text-xs text-muted-foreground mt-1">or click to browse</div>
      <input
        type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </label>
  );
}

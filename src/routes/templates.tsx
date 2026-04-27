import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Template, fetchTemplates, uploadTemplate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ImageIcon, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/templates")({ component: TemplatesPage });

function TemplatesPage() {
  const [list, setList] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [type, setType] = useState<"birthday" | "anniversary" | "festival">("birthday");
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setList(await fetchTemplates()); }
    catch { setList([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file || !name) return toast.error("Choose a file and enter name");
    setUploading(true);
    try {
      await uploadTemplate(file, type, name);
      toast.success("Template uploaded");
      setFile(null); setPreview(""); setName("");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gradient-primary">Templates</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage Birthday, Anniversary and Festival templates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-strong rounded-2xl p-6 space-y-4 shadow-card">
          <h2 className="font-semibold text-lg">Upload New Template</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Template Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Birthday — Classic" className="bg-glass border-glass-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger className="bg-glass border-glass-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <label className="glass rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer border-2 border-dashed border-glass-border hover:border-secondary/50 transition-all">
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-48 rounded-lg shadow-card" />
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow mb-3">
                  <Upload className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="font-semibold">Drop image here or click</div>
                <div className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</div>
              </>
            )}
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </label>

          <Button onClick={handleUpload} disabled={uploading || !file || !name}
            className="w-full gradient-primary text-primary-foreground border-0 shadow-glow">
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Upload Template
          </Button>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Existing Templates</h2>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-44 rounded-2xl skeleton" />)}
            </div>
          ) : list.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No templates uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {list.map((t, i) => (
                <div key={(t.id ?? t._id ?? i) as React.Key} className="glass rounded-2xl p-3 hover-lift">
                  <div className="aspect-video rounded-lg bg-glass overflow-hidden mb-2 flex items-center justify-center">
                    {t.url ? <img src={t.url} alt={t.name} className="w-full h-full object-cover" />
                      : <ImageIcon className="w-8 h-8 text-muted-foreground" />}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{t.name}</div>
                      <Badge variant="outline" className="mt-1 text-[10px] capitalize">{t.type}</Badge>
                    </div>
                    {t.active && <Check className="w-4 h-4 text-success shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

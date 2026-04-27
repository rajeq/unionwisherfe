import { r as reactExports, V as jsxRuntimeExports } from "./worker-entry-D4DgAB3i.js";
import { S as Select, k as SelectTrigger, l as SelectValue, m as SelectContent, n as SelectItem, o as Upload, B as Button, I as Image, C as Check, s as fetchTemplates, t as toast, v as uploadTemplate } from "./router-D_KvtIEs.js";
import { I as Input } from "./input-CgW1QD2v.js";
import { L as Label } from "./label-C8O0lkg1.js";
import { B as Badge } from "./badge-BX9fKnM1.js";
import { L as LoaderCircle } from "./loader-circle-CZoG96vq.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "util";
import "stream";
import "path";
import "http";
import "https";
import "url";
import "fs";
import "crypto";
import "http2";
import "assert";
import "os";
import "zlib";
import "events";
function TemplatesPage() {
  const [list, setList] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [file, setFile] = reactExports.useState(null);
  const [preview, setPreview] = reactExports.useState("");
  const [type, setType] = reactExports.useState("birthday");
  const [name, setName] = reactExports.useState("");
  const [uploading, setUploading] = reactExports.useState(false);
  const load = async () => {
    setLoading(true);
    try {
      setList(await fetchTemplates());
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    load();
  }, []);
  const handleFile = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };
  const handleUpload = async () => {
    if (!file || !name) return toast.error("Choose a file and enter name");
    setUploading(true);
    try {
      await uploadTemplate(file, type, name);
      toast.success("Template uploaded");
      setFile(null);
      setPreview("");
      setName("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl lg:text-3xl font-bold text-gradient-primary", children: "Templates" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Manage Birthday, Anniversary and Festival templates." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-2xl p-6 space-y-4 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-lg", children: "Upload New Template" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Template Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Birthday — Classic", className: "bg-glass border-glass-border" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: type, onValueChange: (v) => setType(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-glass border-glass-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "birthday", children: "Birthday" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "anniversary", children: "Anniversary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "festival", children: "Festival" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "glass rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer border-2 border-dashed border-glass-border hover:border-secondary/50 transition-all", children: [
          preview ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: preview, alt: "Preview", className: "max-h-48 rounded-lg shadow-card" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-6 h-6 text-primary-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Drop image here or click" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "PNG, JPG up to 5MB" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleUpload, disabled: uploading || !file || !name, className: "w-full gradient-primary text-primary-foreground border-0 shadow-glow", children: [
          uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 mr-2" }),
          "Upload Template"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-lg", children: "Existing Templates" }),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: Array.from({
          length: 4
        }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-44 rounded-2xl skeleton" }, i)) }) : list.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-12 text-center text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-8 h-8 mx-auto mb-2 opacity-50" }),
          "No templates uploaded yet."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: list.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-3 hover-lift", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-video rounded-lg bg-glass overflow-hidden mb-2 flex items-center justify-center", children: t.url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: t.url, alt: t.name, className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-8 h-8 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm truncate", children: t.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mt-1 text-[10px] capitalize", children: t.type })
            ] }),
            t.active && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4 text-success shrink-0" })
          ] })
        ] }, t.id ?? t._id ?? i)) })
      ] })
    ] })
  ] });
}
export {
  TemplatesPage as component
};

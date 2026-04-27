import axios from "axios";

export const API_BASE_URL = "https://unionwisher.onrender.com";
export const UNIONS = ["All", "Union A", "Union B", "Union C"] as const;
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

export type WishType = "birthday" | "anniversary";

export interface Employee {
  id?: string;
  _id?: string;
  name: string;
  phone: string;
  email: string;
  union: string;
  dob?: string;
  joiningDate?: string;
  type?: WishType;
};

//
// 🔧 Normalize (_id → id)
//
const normalize = (e: any): Employee => ({
  ...e,
  id: e._id || e.id,
});

//
// 🔧 IST-safe date compare
//
const isToday = (date?: string) => {
  if (!date) return false;

  const today = new Date();
  const d = new Date(date);

  return (
    d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) ===
    today.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
  );
};

//
// 🌐 API
//
export const fetchEmployees = async (union?: string): Promise<Employee[]> => {
  const res = await api.get("/api/employees", {
    params: union && union !== "All" ? { union } : {},
  });

  const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];

  return data.map(normalize);
};

//
// 🎯 Derived logic
//
const getTodayBirthdaysInternal = (employees: Employee[]) =>
  employees
    .filter(e => e.dob && isToday(e.dob))
    .map(e => ({ ...e, type: "birthday" as WishType }));

const getTodayAnniversariesInternal = (employees: Employee[]) =>
  employees
    .filter(e => e.joiningDate && isToday(e.joiningDate))
    .map(e => ({ ...e, type: "anniversary" as WishType }));

//
// ✅ EXPORT THESE (IMPORTANT FIX)
//
export const fetchBirthdaysToday = async (union?: string) => {
  const data = await fetchEmployees(union);
  return getTodayBirthdaysInternal(data);
};

export const fetchAnniversariesToday = async (union?: string) => {
  const data = await fetchEmployees(union);
  return getTodayAnniversariesInternal(data);
};

//
// 📤 Send Wish
//
export const sendWish = async (payload: {
  name: string;
  phone: string;
  email: string;
  union: string;
  type: WishType;
}) => {
  const res = await api.post("/api/send-wish", payload);
  return res.data;
};

//
// 📞 Mask Phone
//
export const maskPhone = (phone?: string) => {
  if (!phone) return "—";
  const s = String(phone);
  if (s.length < 4) return s;
  return s.slice(0, 2) + "•".repeat(Math.max(0, s.length - 4)) + s.slice(-2);
};

//
// 📂 Upload APIs (REQUIRED for upload page)
//
export const uploadJson = async (data: unknown) => {
  const res = await api.post("/api/upload/json", data);
  return res.data;
};

export const uploadCsv = async (file: File) => {
  const fd = new FormData();
  fd.append("file", file);

  const res = await api.post("/api/upload/csv", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const uploadExcel = async (file: File) => {
  const fd = new FormData();
  fd.append("file", file);

  const res = await api.post("/api/upload/excel", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

//
// 🎨 Templates APIs (REQUIRED)
//
export interface Template {
  id?: string;
  _id?: string;
  name: string;
  type: "birthday" | "anniversary" | "festival";
  url?: string;
  active?: boolean;
};

export const fetchTemplates = async (): Promise<Template[]> => {
  const res = await api.get("/api/templates");
  return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
};

export const uploadTemplate = async (
  file: File,
  type: string,
  name: string
) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("type", type);
  fd.append("name", name);

  const res = await api.post("/api/template/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};
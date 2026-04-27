import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type UnionFilter = "All" | "Union A" | "Union B" | "Union C";
type Theme = "dark" | "light";

interface AppContextValue {
  union: UnionFilter;
  setUnion: (u: UnionFilter) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [union, setUnion] = useState<UnionFilter>("All");
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <AppContext.Provider value={{ union, setUnion, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

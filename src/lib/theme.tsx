import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.dataset.themeSwitching = "true";
  root.dataset.theme = next;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      delete root.dataset.themeSwitching;
    });
  });
}

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle() {},
});

export const useTheme = () => useContext(ThemeContext);

const stored = () => {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== "undefined" &&
    document.documentElement.dataset.theme === "light"
      ? "light"
      : "dark",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector("meta[name=theme-color]")!
      .setAttribute("content", theme === "light" ? "#fffaf2" : "#171614");
  }, [theme]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const follow = (e: MediaQueryListEvent) => {
      if (!stored()) {
        const next = e.matches ? "light" : "dark";
        applyTheme(next);
        setTheme(next);
      }
    };
    query.addEventListener("change", follow);
    return () => query.removeEventListener("change", follow);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  return <ThemeContext value={{ theme, toggle }}>{children}</ThemeContext>;
}

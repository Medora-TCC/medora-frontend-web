import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { type ThemeName, themes } from "./themeColors";

interface ThemeContextProps {
  theme: ThemeName;
  toggleTheme: () => void;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeName>("dark");

  useEffect(() => {
    const localStorageTheme = localStorage.getItem("medora-theme") as ThemeName;
    console.log(localStorageTheme)
    if (localStorageTheme && themes[localStorageTheme]) {
      setTheme(localStorageTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("medora-theme", theme);

    const currentPallete = themes[theme];
    Object.entries(currentPallete).forEach(([cssVariable, colorValue]) => {
      root.style.setProperty(cssVariable, colorValue)
    });
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  return context;
}
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { themes } from "./themeColors";
const ThemeContext = createContext(undefined);
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("dark");
    useEffect(() => {
        const localStorageTheme = localStorage.getItem("medora-theme");
        console.log(localStorageTheme);
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
            root.style.setProperty(cssVariable, colorValue);
        });
    }, [theme]);
    const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
    return _jsx(ThemeContext.Provider, { value: { theme, toggleTheme, setTheme }, children: children });
};
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context)
        throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
    return context;
}

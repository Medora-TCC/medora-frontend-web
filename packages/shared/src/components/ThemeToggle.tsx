import { Sun, Moon } from "lucide-react";
import { useTheme } from "../theme/ThemeContext"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Alternar tema"
      className="
        rounded-lg p-2 transition-colors
        text-text-muted
      "
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
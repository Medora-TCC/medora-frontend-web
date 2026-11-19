import { Sun, Moon } from "lucide-react";
import { useTheme } from "../theme/ThemeContext"
import { Button } from "@heroui/react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button isIconOnly variant="ghost" className="text-text-muted rounded-lg p-2 transition-colors"
      onClick={toggleTheme}
      aria-label="Alternar tema"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
}
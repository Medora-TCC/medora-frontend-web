import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from "../theme/ThemeContext";
export function Teste() {
    const { toggleTheme } = useTheme();
    return _jsxs("div", { className: "bg-surface text-accent", children: ["Teste ", _jsx("button", { onClick: toggleTheme, children: "Trocar" })] });
}

import { useTheme } from "../theme/ThemeContext"

export function Teste() {
    const {toggleTheme} = useTheme();
    return <div className="bg-surface text-accent">Teste <button onClick={toggleTheme}>Trocar</button></div>
}
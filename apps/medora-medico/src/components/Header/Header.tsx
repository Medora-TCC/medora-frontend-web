import { useState, useRef, useEffect } from 'react';
import { Activity, LogOut, Settings, User, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ThemeToggle } from '@medora_web/shared';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
    doctorName: string | null;
    mainSpecialty: string | null;
    extraSpecialtiesCount: number;
    onOpenSpecialties: () => void;
    photoUrl: string | null;
}

function getInitials(name: string | null): string {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
}
function getShortName(name: string | null): string {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : parts[0];
}

export default function Header({
    doctorName,
    mainSpecialty,
    extraSpecialtiesCount,
    onOpenSpecialties,
    photoUrl,
}: HeaderProps) {
    const navigate = useNavigate();

    const { signOut } = useAuth()
    
    const [profileOpen, setProfileOpen] = useState(false);

    const profileRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        signOut();
        navigate("/");
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="flex justify-between items-center py-2 px-6 bg-surface backdrop-blur-md shadow-sm sticky top-0 z-50 border-b h-14">
            {/* Logo */}
            <div className="flex items-center gap-2 select-none">
                <Activity className="w-6 h-6 text-primary-600" />
                <h1 className="text-lg font-bold text-primary-900">Medora</h1>
            </div>

            {/* Ações da Direita */}
            <div className="flex items-center gap-3">
                
                {/* Alternador de Tema */}
                <ThemeToggle />


                {/* Divisor Visual */}
                <div className="h-5 w-px bg-divider mx-1" />

                {/* Dropdown do Perfil do Médico */}
                <div className="relative" ref={profileRef}>
                    <button
                        type="button"
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity focus:outline-none select-none"
                    >
                        <div className="hidden md:block text-right">
                            <p className="text-xs font-bold text-text-primary leading-none">
                                {doctorName ? getShortName(doctorName) : "Carregando..."}
                            </p>
                            <p className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">
                                {mainSpecialty
                                    ? <>{mainSpecialty}{extraSpecialtiesCount > 0 && ` +${extraSpecialtiesCount}`}</>
                                    : <span className="text-orange-500">Sem especialidade</span>}
                            </p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-primary-color flex items-center justify-center text-white text-xs font-bold shadow-sm border border-surface overflow-hidden">
                            {photoUrl
                                ? <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                                : getInitials(doctorName)}
                        </div>
                    </button>

                    {/* Menu Flutuante do Perfil */}
                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-surface border border-divider rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                            <button 
                                onClick={() => { navigate("/medico/perfil"); setProfileOpen(false); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-muted/50 text-left"
                            >
                                <User size={16} className="text-text-muted" />
                                <span>Meu Perfil</span>
                            </button>
                            <button
                                onClick={() => { onOpenSpecialties(); setProfileOpen(false); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-muted/50 text-left"
                            >
                                <Stethoscope size={16} className="text-text-muted" />
                                <span>Minhas especialidades</span>
                            </button>
                            <button 
                                onClick={() => { navigate("/medico/configuracoes"); setProfileOpen(false); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-muted/50 text-left"
                            >
                                <Settings size={16} className="text-text-muted" />
                                <span>Configurações</span>
                            </button>
                            
                            <div className="border-t border-divider my-1" />
                            
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-left font-medium"
                            >
                                <LogOut size={16} />
                                <span>Sair do sistema</span>
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </nav>
    );
}
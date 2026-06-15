import { useState, useRef, useEffect } from 'react';
import { Activity, Bell, LogOut, Settings, User } from 'lucide-react';
import { Button } from '@heroui/react';
import { useNavigate } from 'react-router';
import { ThemeToggle } from '@medora_web/shared';

export default function Header() {
    const navigate = useNavigate();
    
    // Estados para controlar o que está aberto
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    // Refs para fechar ao clicar fora
    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        navigate("/");
    };

    // Fecha os menus se o usuário clicar fora deles
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
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
                
                {/* Dropdown de Notificações */}
                <div className="relative" ref={notifRef}>
                    <Button 
                        isIconOnly 
                        variant="ghost" 
                        className="text-text-muted"
                        onPress={() => {
                            setNotifOpen(!notifOpen);
                            setProfileOpen(false); // Fecha o outro se abrir este
                        }}
                    >
                        <Bell size={18} />
                    </Button>

                    {/* Menu Flutuante de Notificações */}
                    {notifOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-surface border border-divider rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                            <div className="px-4 py-2 hover:bg-muted/50 cursor-pointer border-b border-divider/50">
                                <p className="text-sm text-text-primary">Prontuário atualizado</p>
                                <p className="text-xs text-text-muted mt-0.5">Há 1 hora</p>
                            </div>
                            <div className="px-4 py-2 hover:bg-muted/50 cursor-pointer">
                                <p className="text-sm text-text-primary">Nova consulta agendada</p>
                                <p className="text-xs text-text-muted mt-0.5">Há 2 horas</p>
                            </div>
                            <button className="w-full text-center text-primary-600 font-semibold text-xs pt-2 pb-1 border-t border-divider/50 hover:underline">
                                Ver todas as notificações
                            </button>
                        </div>
                    )}
                </div>

                {/* Alternador de Tema */}
                <Button isIconOnly variant="ghost" className="text-text-muted">
                    <ThemeToggle />
                </Button>

                {/* Divisor Visual */}
                <div className="h-5 w-[1px] bg-divider mx-1" />

                {/* Dropdown do Perfil do Médico */}
                <div className="relative" ref={profileRef}>
                    <button
                        type="button"
                        onClick={() => {
                            setProfileOpen(!profileOpen);
                            setNotifOpen(false); // Fecha o outro se abrir este
                        }}
                        className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity focus:outline-none select-none"
                    >
                        <div className="hidden md:block text-right">
                            <p className="text-xs font-bold text-text-primary leading-none">Dr. Pedro Silva</p>
                            <p className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">Cardiologia</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-primary-color flex items-center justify-center text-white text-xs font-bold shadow-sm border border-surface">
                            DR
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
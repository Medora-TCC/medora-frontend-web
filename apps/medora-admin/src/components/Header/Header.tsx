import { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, Settings, ShieldCheck, User } from 'lucide-react';
import { Button } from '@heroui/react';
import { useNavigate } from 'react-router';
import { ThemeToggle } from '@medora_web/shared';

export default function AdminHeader() {
    const navigate = useNavigate();
    
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null); 

    const handleLogout = () => {
        navigate("/");
    };

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
                <ShieldCheck className="w-6 h-6 text-primary-600" />
                <h1 className="text-lg font-bold text-primary-900">Medora Admin</h1>
            </div>

            <div className="flex items-center gap-3">
                
                <div className="relative" ref={notifRef}>
                    <Button 
                        isIconOnly 
                        variant="ghost" 
                        className="text-text-muted relative"
                        onPress={() => {
                            setNotifOpen(!notifOpen);
                            setProfileOpen(false);
                        }}
                    >
                        <Bell size={18} />
                        {/* Bolinha vermelha para indicar notificação nova */}
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-surface"></span>
                    </Button>

                    {notifOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-surface border border-divider rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                            <div className="px-4 py-2 hover:bg-muted/15 cursor-pointer border-b border-divider/50">
                                <p className="text-sm font-medium text-text-primary">Timeout na verificação InfoSimples</p>
                                <p className="text-xs text-text-muted mt-0.5">CRM-SP 112034 não foi verificado corretamente.</p>
                                <p className="text-[10px] text-text-muted/80 mt-1">Há 10 min</p>
                            </div>
                            <div className="px-4 py-2 hover:bg-muted/15 cursor-pointer">
                                <p className="text-sm font-medium text-text-primary">Worker: Sincronização Incompleta</p>
                                <p className="text-xs text-text-muted mt-0.5">244 de 245 Verificações do dia feitas</p>
                                <p className="text-[10px] text-text-muted/80 mt-1">Há 1 hora</p>
                            </div>
                            <button className="w-full text-center text-primary-600 font-semibold text-xs pt-2 pb-1 border-t border-divider/50 hover:underline mt-1">
                                Ver todas as notificações do sistema
                            </button>
                        </div>
                    )}
                </div>

                <Button isIconOnly variant="ghost" className="text-text-muted">
                    <ThemeToggle />
                </Button>

                <div className="h-5 w-px bg-divider mx-1" />

                <div className="relative" ref={profileRef}>
                    <button
                        type="button"
                        onClick={() => {
                            setProfileOpen(!profileOpen);
                            setNotifOpen(false);
                        }}
                        className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity focus:outline-none select-none"
                    >
                        <div className="hidden md:block text-right">
                            <p className="text-xs font-bold text-text-primary leading-none">Administrador</p>
                            <p className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">TI & Sistemas</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-sm border border-surface">
                            AD
                        </div>
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-surface border border-divider rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                            <button 
                                onClick={() => { navigate("/admin/profile"); setProfileOpen(false); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-muted/50 text-left"
                            >
                                <User size={16} className="text-text-muted" />
                                <span>Minha Conta</span>
                            </button>
                            
                            <button 
                                onClick={() => { navigate("/admin/config"); setProfileOpen(false); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-muted/50 text-left"
                            >
                                <Settings size={16} className="text-text-muted" />
                                <span>Configurações Globais</span>
                            </button>
                            
                            <div className="border-t border-divider my-1" />
                            
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-left font-medium"
                            >
                                <LogOut size={16} />
                                <span>Encerrar Sessão</span>
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </nav>
    );
}
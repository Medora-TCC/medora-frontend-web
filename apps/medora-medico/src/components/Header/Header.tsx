import { Activity, Bell } from 'lucide-react';
import { Button } from '@heroui/react';
import { useNavigate } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { ThemeToggle } from '@medora_web/shared';

export default function Header() {
    const navigate = useNavigate();

    return (
        <nav className="flex justify-between items-center p-6 bg-surface backdrop-blur-md shadow-sm sticky top-0 z-50 border-b">
            <div className="flex items-center gap-2">
                <Activity className="w-8 h-8 text-primary-600" />
                <h1 className="text-2xl font-bold text-primary-900">Medora</h1>
            </div>
            <div className="flex items-center gap-4">
                <Button isIconOnly variant="ghost" className="text-text-muted">
                    <Bell size={20} />
                </Button>
                <Button isIconOnly variant="ghost" className="text-text-muted">
                    <ThemeToggle />
                </Button>
                <div className="flex items-center gap-3 pl-4 border-l border-divider">
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-bold text-text-primary leading-none">Dr. João</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Cardiologista</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary-color flex items-center justify-center text-white font-bold shadow-sm border-2 border-surface">
                        DR
                    </div>
                </div>
            </div>
        </nav>
    )
}
import {Activity} from 'lucide-react';
import { Button } from '@heroui/react';
import { useNavigate } from 'react-router';
import { ChevronRight } from 'lucide-react';

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="flex justify-between items-center p-6 bg-surface backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-primary-900">Medora</h1>
            </div>
        </nav>
    )
}
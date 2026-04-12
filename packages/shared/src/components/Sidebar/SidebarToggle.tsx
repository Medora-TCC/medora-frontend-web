import { Menu } from 'lucide-react';

interface SidebarToggleProps {
  isOpen: boolean;
  onOpen: () => void;
}

export function SidebarToggle({ isOpen, onOpen }: SidebarToggleProps) {
  if (isOpen) 
    return null;

  return (
    <button 
      onClick={onOpen}
      className="fixed top-4 left-4 z-50 p-2 bg-[#2b2b40]
       text-white rounded-md md:hidden shadow-lg border border-white/10"
    >
      <Menu size={24} />
    </button>
  );
}
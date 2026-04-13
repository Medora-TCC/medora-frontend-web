import type { ReactNode } from 'react';

interface SidebarRootProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarRoot({ children, isOpen, onClose }: SidebarRootProps) {
  return (
    <>
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-60 transition-opacity md:hidden
            ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      <aside className={`
        overflow-x-hidden 
        fixed inset-y-0 left-0 z-70 bg-surface-alt 
        transition-all duration-300 ease-in-out transform
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
        md:translate-x-0 md:relative md:z-auto md:flex 
        md:h-screen flex-col border-r border-border
        md:w-20 md:hover:w-64 group
      `}>
        {children}
      </aside>
    </>
  );
}
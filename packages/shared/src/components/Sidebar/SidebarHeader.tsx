import type { ReactNode } from 'react';

interface SidebarHeaderProps {
  children: ReactNode;
}

export function SidebarHeader({ children }: SidebarHeaderProps) {
  return (
    <div className="flex items-center h-20 px-6 overflow-hidden shrink-0 border-b border-border">
      {children}
    </div>
  );
}
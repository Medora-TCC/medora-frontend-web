import { ReactNode } from 'react';

interface SidebarFooterProps {
  children: ReactNode;
}

export function SidebarFooter({ children }: SidebarFooterProps) {
  return (
    <div className="mt-auto p-4 border-t border-white/5 overflow-hidden shrink-0">
      {children}
    </div>
  );
}
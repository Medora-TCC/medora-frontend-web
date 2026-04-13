import { type ReactNode } from "react";

interface SidebarFooterProps {
  children: ReactNode;
}

export function SidebarFooter({ children }: SidebarFooterProps) {
  return (
    <div className="mt-auto p-4 border-t border-border overflow-hidden shrink-0">
      {children}
    </div>
  );
}
import type { ElementType } from 'react';

interface SidebarSubItemProps {
  icon?: ElementType;
  label: string;
  href?: string;
}

export function SidebarSubItem({ icon: Icon, label, href }: SidebarSubItemProps) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 py-2 pl-12 pr-4 
      text-sm text-text-muted hover:text-text-primary hover:bg-surface-raised rounded-md transition-colors"
    >
      {Icon && <Icon size={18} />}
      <span>{label}</span>
    </a>
  );
}
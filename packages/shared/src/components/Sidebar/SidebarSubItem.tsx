
interface SidebarSubItemProps {
  icon?: React.ElementType;
  label: string;
  href?: string;
}

export function SidebarSubItem({ icon: Icon, label, href }: SidebarSubItemProps) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 py-2 pl-12 pr-4 
      text-sm text-gray-400 hover:text-white transition-colors"
    >
      {Icon && <Icon size={18} />}
      <span>{label}</span>
    </a>
  );
}
interface SidebarSectionProps {
  title: string;
}

export function SidebarSection({ title }: SidebarSectionProps) {
  return (
    <div className="px-6 mt-8 mb-2 h-6 overflow-hidden">
      <span className={`
        block text-[11px] font-bold uppercase tracking-wider text-text-muted 
        transition-all duration-300 whitespace-nowrap
        md:opacity-0 md:group-hover:opacity-100 
        max-md:opacity-100
      `}>
        {title}
      </span>
    </div>
  );
}


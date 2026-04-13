import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  children?: ReactNode;
  isActive?: boolean;
}

export function SidebarItem({ icon: Icon, label, children, isActive }: SidebarItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = !!children;

  return (
    <div className="px-3 w-full overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center p-3 rounded-lg transition-all
          ${isActive ? 'bg-[#2b2b40] text-white' : 'text-gray-400 hover:bg-[#2b2b40] hover:text-white'}
        `}
      >
        <div className="flex items-center justify-center w-8 shrink-0">
          <Icon size={22} />
        </div>
        
        <span className={`
          text-sm font-medium transition-all duration-300 whitespace-nowrap
          
          md:ml-0 md:opacity-0 md:group-hover:ml-4 md:group-hover:opacity-100
          
          max-md:ml-4 max-md:opacity-100
        `}>
          {label}
        </span>

        {hasChildren && (
          <ChevronDown 
            size={16} 
            className={`
              ml-auto transition-all duration-300
              md:opacity-0 md:group-hover:opacity-100
              max-md:opacity-100 
              ${isOpen ? 'rotate-180' : ''}
            `} 
          />
        )}
      </button>

      <div className={`
        overflow-hidden transition-all duration-300
        ${isOpen ? 'max-h-40' : 'max-h-0'}
        md:invisible md:group-hover:visible
        max-md:visible
      `}>
        {children}
      </div>
    </div>
  );
}
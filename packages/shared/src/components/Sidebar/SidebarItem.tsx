import { useState } from 'react';
import type { ReactNode, ElementType } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router';

interface SidebarItemProps {
  icon: ElementType;
  label: string;
  children?: ReactNode;
  isActive?: boolean;
  href?: string;
}

export function SidebarItem({ icon: Icon, label, children, isActive, href }: SidebarItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = !!children;

  const innerContent = (
    <>
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
            ${isOpen ? 'rotate-180' : 'rotate-0'}
          `} 
        />
      )}
    </>
  );

  const baseClassName = `
    w-full flex items-center p-3 rounded-lg transition-all relative
    ${isActive 
      ? 'bg-primary-subtle text-primary-text'
      : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'
    }
  `;

  return (
    <div 
      className="[.section-marker+&]:mt-0 mt-5 px-3 w-full overflow-hidden"
      onMouseLeave={() => setIsOpen(false)}
    >
      
      {!hasChildren && href ? (
        <Link to={href} className={baseClassName}>
          {innerContent}
        </Link>
      ) : (
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className={baseClassName}
          type="button"
        >
          {innerContent}
        </button>
      )}

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
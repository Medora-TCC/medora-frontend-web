import type { ReactNode } from 'react';

interface AbsoluteCenterProps {
  children: ReactNode;
  className?: string;
}

export function AbsoluteCenter({ children, className = '' }: AbsoluteCenterProps) {
  return (
    <div className={`min-h-screen grid place-items-center w-full bg-gray-50 ${className}`}>
        {children}
    </div>
  );
}
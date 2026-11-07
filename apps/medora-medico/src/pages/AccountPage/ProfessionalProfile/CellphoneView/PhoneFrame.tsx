import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="w-93.75 h-180 shrink-0 rounded-[2.5rem] border-10 border-surface-raised bg-surface shadow-xl overflow-hidden"
      aria-label="Pré-visualização do perfil no aplicativo"
    >
      <div className="h-full overflow-y-auto">{children}</div>
    </div>
  );
}
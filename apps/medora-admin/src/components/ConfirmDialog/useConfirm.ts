import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface ConfirmOptions {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
}

export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const resolve = useCallback((confirmed: boolean) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  return { confirm, dialogProps: { options, onResolve: resolve } };
}
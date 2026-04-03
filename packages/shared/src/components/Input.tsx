import type { ComponentProps } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}


export function Input({label, id, ...restProps }: InputProps) {
  return (
    <div className="relative mt-6">
      
      <input  {...restProps}
              id={id} 
              placeholder=" "
            className="peer h-10 w-full border-b-2 border-(--border)
            text-(--text-primary) bg-transparent
            placeholder-transparent focus:outline-none focus:border-(--primary)
            transition-all
            "  
      />
      <label
                htmlFor={id}
                className="
                    absolute left-0 -top-3.5 text-[var(--text-muted)] text-sm 
                    transition-all cursor-text
                    
                    /* Lógica do Peer */
                    peer-placeholder-shown:text-base 
                    peer-placeholder-shown:text-[var(--text-muted)] 
                    peer-placeholder-shown:top-2
                    peer-focus:-top-3.5 
                    peer-focus:text-[var(--primary)] 
                    peer-focus:text-sm
                "
            >
                {label}
            </label>
    </div>
  )
}


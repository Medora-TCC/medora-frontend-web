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
                    absolute left-0 -top-3.5 text-(--text-muted) text-sm 
                    transition-all cursor-text
                    
                    peer-placeholder-shown:text-base 
                    peer-placeholder-shown:text-(--text-muted) 
                    peer-placeholder-shown:top-2
                    peer-focus:-top-3.5 
                    peer-focus:text-(--primary) 
                    peer-focus:text-sm
                "
            >
                {label}
            </label>
    </div>
  )
}


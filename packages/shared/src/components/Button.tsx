import React, { ComponentProps } from "react";

interface ButtonProps extends ComponentProps<'button'> {
    isLoading?: boolean;
}

const Button = ({
    children,
    disabled = false,
    isLoading = false,
    className = '',
    ...restProps }: ButtonProps) => {

        return (
            <button 
            disabled={disabled || isLoading}
            {...restProps}
            className={`
                bg-[var(--primary)] text-[var(--text-inverse)] font-semibold py-2 px-4 rounded-md
                hover:bg-[var(--primary-hover)]
                disabled:bg-[var(--surface-alt)] disabled:text-[var(--text-muted)]
                transition-colors duration-200
                ${isLoading ? 'cursor-wait opacity-80' : 'disabled:cursor-not-allowed'}
                ${className} 
            `}
        >
            {isLoading ? 'Carregando...' : children}
        </button>
        )
    }

export default Button;

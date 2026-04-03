import { jsx as _jsx } from "react/jsx-runtime";
export function Button({ children, disabled = false, isLoading = false, className = '', ...restProps }) {
    return (_jsx("button", { disabled: disabled || isLoading, ...restProps, className: `
                bg-primary text-text-inverse font-semibold py-2 px-4 rounded-md
                hover:bg-primary-hover
                disabled:bg-surface-overlay disabled:text-text-muted 
                transition-colors duration-200
                ${isLoading ? 'cursor-wait opacity-80 ' : 'disabled:cursor-not-allowed'}
                ${className} 
            `, children: isLoading ? 'Carregando...' : children }));
}

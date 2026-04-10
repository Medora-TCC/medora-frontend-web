import React from "react";


interface FieldWrapperProps {
    label?: string;
    description?: React.ReactNode;
    children: React.ReactNode;
}

export function FieldWrapper({ label, description, children }: FieldWrapperProps) {
    return (
        <div className="flex flex-col w-full">
            {label && (
                <label className="text-sm font-medium mb-1 text-default-700">
                    {label}
                </label>
            )}
            
            {children}
            
            {description && (
                <div className="text-xs text-default-500 mt-1">
                    {description}
                </div>
            )}
        </div>
    );
}
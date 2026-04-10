import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@heroui/react";
import {Eye, EyeOff} from 'lucide-react';

export interface PasswordRules {
    id: string;
    label: string;
    validate: (password: string) => boolean;
}

interface PasswordInputProps {
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    hasError?: boolean;
    placeholder?: string;
    rules?: PasswordRules[];
}

const defaultRules: PasswordRules[] = [
    { id: 'uppercase', label: 'Contenha 1 letra maiúscula ABC', validate: (v: string) => /[A-Z]/.test(v) },
    { id: 'special', label: 'Contenha 1 caracter especial !@#$%^&*()-+', validate: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
    { id: 'number', label: 'Contenha 1 número 123', validate: (v: string) => /[0-9]/.test(v) },
    { id: 'length', label: 'Mínimo de 6 caracteres', validate: (v: string) => v.length >= 6 },
];

export function PasswordInput({ id, value, onChange, label, hasError, placeholder, rules = defaultRules }: PasswordInputProps) {

    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showPopover, setShowPopover] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const evaluatedRules = useMemo(() => {
        return rules.map(rule => ({
            ...rule,
            isValid: rule.validate(value)
        }));
    }, [value, rules]);

    const validCount = evaluatedRules.filter(r => r.isValid).length;
    const totalRules = rules.length;
    const strengthPercentage = totalRules > 0 ? (validCount / totalRules) * 100 : 0;

    const strengthColor = useMemo(() => {
        if (strengthPercentage <= 25) return "bg-danger"; 
        if (strengthPercentage <= 50) return "bg-warning";
        if (strengthPercentage <= 75) return "bg-[#ADFF2F]";
        return "bg-success"; 
    }, [strengthPercentage]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowPopover(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShowPopover(true);
        onChange(e);
    };
    
    return (
        <div className="flex flex-col w-full relative" ref={containerRef}>
            {label && <label className="text-sm font-medium mb-1 text-default-700">{label}</label>}
            
            <div className="relative w-full">
                <Input
                    id={id}
                    type={isVisible ? "text" : "password"}
                    value={value}
                    onChange={handleTyping}
                    onFocus={() => setShowPopover(true)}
                    placeholder={placeholder || "Digite sua senha"}
                    className={`w-full border rounded p-2 pr-10 transition-colors ${
                        hasError 
                            ? 'border-danger text-danger focus:border-danger' 
                            : 'border-default-200 focus:border-primary'
                    }`}
                />
                
                <div 
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-gray-700 z-10" 
                    onClick={toggleVisibility}
                >
                    {isVisible ? (
                        <Eye className="w-5 h-5" />
                    ) : (
                        <EyeOff className="w-5 h-5" />
                    )}
                </div>
            </div>

            {showPopover && (
                <div 
                    className="absolute top-full mt-2 left-0 w-full z-50 p-4 bg-white border border-gray-200 rounded-xl shadow-xl animate-appearance-in cursor-pointer"
                    onClick={() => setShowPopover(false)}
                    title="Clique para fechar"
                >
                    <p className="text-sm font-medium text-gray-700 mb-2">Força da senha</p>
                    
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-300 ease-in-out ${strengthColor}`} 
                            style={{ width: `${strengthPercentage}%` }}
                        ></div>
                    </div>

                    <p className="text-xs text-gray-500 mb-2 font-medium">Sugestões:</p>
                    <ul className="text-xs space-y-2">
                        {evaluatedRules.map((rule) => (
                            <li key={rule.id} className={`flex items-start gap-2 transition-colors ${rule.isValid ? 'text-success' : 'text-gray-500'}`}>
                                <span className="text-sm leading-none mt-0.5">
                                    {rule.isValid ? '✓' : '•'}
                                </span> 
                                <span>{rule.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@heroui/react";

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
    error?: string;
    placeholder?: string;
    rules?: PasswordRules[];
}

const defaultRules: PasswordRules[] = [
    { id: 'uppercase', label: 'Contenha 1 letra maiúscula ABC', validate: (v: string) => /[A-Z]/.test(v) },
    { id: 'special', label: 'Contenha 1 caracter especial !@#$%^&*()-+', validate: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
    { id: 'number', label: 'Contenha 1 número 123', validate: (v: string) => /[0-9]/.test(v) },
    { id: 'length', label: 'Mínimo de 6 caracteres', validate: (v: string) => v.length >= 6 },
];

export function PasswordInput({ id, value, onChange, label, error, placeholder, rules = defaultRules }: PasswordInputProps) {

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
                    className="w-full border rounded p-2 pr-10"
                />
                
                <div 
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-gray-700 z-10" 
                    onClick={toggleVisibility}
                >
                    {isVisible ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    )}
                </div>
            </div>

            {error && <span className="text-xs text-danger mt-1">{error}</span>}

            {showPopover && (
                <div 
                    className="absolute top-full mt-2 left-0 w-full z-50 p-4 bg-white border border-gray-200 rounded-xl shadow-xl animate-appearance-in cursor-pointer"
                    onClick={() => setShowPopover(false)} // <-- A MÁGICA DE FECHAR AO CLICAR EM CIMA ESTÁ AQUI
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
                                <span className="text-sm leading-none mt-[2px]">
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
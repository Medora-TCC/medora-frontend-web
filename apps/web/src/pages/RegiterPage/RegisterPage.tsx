import { useState, useEffect, use } from "react";
import { Input, Button, Separator, Select, toast } from "@heroui/react";
import { AbsoluteCenter } from "@medora_web/shared";
import doctorImage from '../../assets/DoctorRegisterPage.jpeg';
import type { RegisterDoctorDto } from "../../api/dtos/RegisterDoctorDto";
import { Endpoints } from "../../api/enums/endpoints";
import { PasswordInput, type PasswordRules } from "@medora_web/shared";
    
const FieldWrapper = ({ label, error, children, description }: any) => (
    <div className="flex flex-col w-full">
        {label && <label className="text-sm font-medium mb-1 text-default-700">{label}</label>}
        {children}
        {error && <span className="text-xs text-danger mt-1">{error}</span>}
        {description && <div className="mt-1">{description}</div>}
    </div>
);


export function RegisterPage() {
    const [formData, setFormData] = useState<RegisterDoctorDto>({
        name: '',
        email: '',
        password: '',
        state: 'PR',
        crm: '',
        rqe: '', 
        cpf: ''
    });
    
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = useState(1);
    
    
    // const [isVisible, setIsVisible] = useState(false);
    // const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    // const toggleVisibility = () => setIsVisible(!isVisible);
    // const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    setFormData((prevData) => ({
        ...prevData, [id]: value
    }));

    if (errors[id]) {
        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[id];
            return newErrors;
            });
        }
    };

    const myCustomRules: PasswordRules[] = [
        { 
            id: 'crm-rule', 
            label: 'A senha não pode ser igual ao seu nome', 
            validate: (v: string) => v.length > 0 && formData.name.length > 0 ? !v.toLowerCase().includes(formData.name.toLowerCase()) : true 
        },
        { 
            id: 'strong', 
            label: 'Ter pelo menos 8 caracteres', 
            validate: (v: string) => v.length >= 8 
        },
        { 
            id: 'special', 
            label: 'Símbolos (!@#$)', 
            validate: (v: string) => /[!@#$%^&*()]/.test(v) 
        }
    ];

    const states = [
        { label: 'Paraná (PR)', value: 'PR' },
        { label: 'São Paulo (SP)', value: 'SP' },
        { label: 'Santa Catarina (SC)', value: 'SC' },
        { label: 'Rio de Janeiro (RJ)', value: 'RJ' }
    ];

    const handleStateChange = () => {
        const newErrors: Record<string, string> = {};
        
        if (formData.name === '') 
            newErrors.name = 'Nome é obrigatório';
        if (formData.email === '' || !/\S+@\S+\.\S+/.test(formData.email)) 
            newErrors.email = 'Email válido é obrigatório';
        if (formData.password === '' || formData.password.length < 6) 
            newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        if (confirmPassword === '' || confirmPassword !== formData.password) 
            newErrors.confirmPassword = 'As senhas devem coincidir';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setCurrentStep(2);
    }   
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        
        if (formData.state === '') 
            newErrors.state = 'Estado é obrigatório';
        if (formData.crm === '') 
            newErrors.crm = 'CRM é obrigatório';
        if (formData.rqe === '') 
            newErrors.rqe = 'RQE é obrigatório';
        if (formData.cpf === '') 
            newErrors.cpf = 'CPF é obrigatório';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        fetch(Endpoints.REGISTER_DOCTOR, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        }).then(response => {
            if (response.ok) {
                toast.success('Registro bem-sucedido!');
            } else {
                toast.warning('Erro ao registrar médico. Por favor, tente novamente.');
            }
        }).catch(error => {
            console.error('Erro ao registrar médico:', error);
        });   
    }

    return (
        <AbsoluteCenter className="bg-background-tertiary"> 
            <div className="flex flex-col md:flex-row w-full max-w-7xl h-fit md:h-[90vh] bg-background-secondary rounded-2xl shadow-2xl overflow-hidden m-4">
                
                <div className="w-full md:w-1/2 flex justify-center items-center p-8 sm:p-12 lg:p-16">
                    <div className="w-full max-w-md flex flex-col gap-6">
                        <div>
                            <h1 className="text-primary-text text-3xl font-bold text-center mb-1">Crie sua conta médica</h1>
                            <h3 className="text-center mb-1 text-text-secondary">Junte-se a milhares de profissionais...</h3>
                        </div>
                        
                        <form onSubmit={handleFormSubmit} className="relative min-h-105 w-full">
                            {currentStep === 1 && (
                                <div className="flex flex-col gap-5 animate-appearance-in">
                                    
                                    <FieldWrapper label="Nome" error={errors.name}>
                                        <Input id="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded p-2" />
                                    </FieldWrapper>

                                    <FieldWrapper label="Email" error={errors.email}>
                                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full border rounded p-2" />
                                    </FieldWrapper>

                                    <PasswordInput
                                        id="password"
                                        label="Senha"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        error={errors.password}
                                    />

                                    <FieldWrapper label="Confirmar Senha" error={errors.confirmPassword}>
                                        <Input 
                                            id="confirmPassword" 
                                            type="password" 
                                            value={confirmPassword} 
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (errors.confirmPassword) {
                                                    setErrors(prev => ({ ...prev, confirmPassword: '' }));
                                                }
                                            }} 
                                            className="w-full border rounded p-2" 
                                        />
                                    </FieldWrapper>

                                    <Button variant="primary" size="lg" className="w-full mt-2 font-medium" onClick={handleStateChange}>
                                        <div className="flex items-center justify-center gap-2">
                                            Próximo
                                        </div>
                                    </Button>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="flex flex-col gap-5 animate-appearance-in">
                                    <div className="flex gap-2 w-full items-start">
                                        <FieldWrapper label="UF" error={errors.state}>
                                            <Select selectedKey={formData.state} onSelectionChange={(key) => setFormData({...formData, state: key as string})} className="w-full border rounded p-2">
                                                {states.map((state) => (
                                                    <option key={state.value} value={state.value}>{state.label}</option>
                                                ))}
                                            </Select>
                                        </FieldWrapper>

                                        <FieldWrapper label="CRM" error={errors.crm}>
                                            <Input id="crm" value={formData.crm} onChange={handleInputChange} className="w-full border rounded p-2" />
                                        </FieldWrapper>
                                    </div>

                                    <FieldWrapper label="RQE" error={errors.rqe}>
                                        <Input 
                                        id="rqe"
                                        value={formData.rqe}
                                        onChange={handleInputChange}
                                        className="w-full border rounded p-2" />
                                    </FieldWrapper>

                                    <FieldWrapper label="CPF" error={errors.cpf}>
                                        <Input 
                                        id="cpf"
                                        value={formData.cpf}
                                        onChange={handleInputChange}
                                        className="w-full border rounded p-2" />
                                    </FieldWrapper>

                                    <div className="flex gap-4 mt-2">
                                        <Button variant="outline" size="lg" className="w-1/2 font-medium" onClick={() => setCurrentStep(1)}>
                                            <div className="flex items-center justify-center gap-2">
                                                 Voltar
                                            </div>
                                        </Button>
                                        <Button 
                                        variant="primary"
                                        size="lg"
                                        type="submit"
                                        className="w-1/2 font-medium">
                                            Finalizar
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                        <a href="#" className="text-sm text-center text-primary mt-2 hover:underline">
                            já tem uma conta? faça login
                        </a>
                    </div>
                </div>

                <div className="hidden md:flex md:w-1/2 bg-primary">
                    <img src={doctorImage} alt="Imagem de registro" className="h-full w-full object-cover" />
                </div>
            
            </div>
        </AbsoluteCenter>
    )
}
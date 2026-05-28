import { useState } from "react";
import { Input, Button, toast, ToastProvider } from "@heroui/react";
import { FloatingCard, FormStepper } from "@medora_web/shared";
import doctorImage from '../../assets/medicoSegurandoTable.png';
import type { RegisterDoctorDto } from "../../api/dtos/RegisterDoctorDto";
import { Endpoints } from "../../api/enums/endpoints";
import { PasswordInput } from "@medora_web/shared";
import { FieldWrapper } from "@medora_web/shared";
import { ChevronDown } from "lucide-react";

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
            const firstErrorMessage = Object.values(newErrors)[0];
            toast.warning(firstErrorMessage);
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
            const firstErrorMessage = Object.values(newErrors)[0];
            toast.warning(firstErrorMessage);
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
            <>
            <ToastProvider/>
           <div className="flex flex-col md:flex-row w-full max-w-7xl h-fit md:h-[90vh] bg-surface rounded-3xl shadow-2xl overflow-hidden m-4 border border-border/50 mx-auto">
                
                <div className="w-full md:w-1/2 flex justify-center items-center p-8 sm:p-12 lg:p-16 relative z-10">
                    <div className="w-full max-w-md flex flex-col gap-4">
                        <FormStepper currentStep={currentStep} />
                        <div>
                            <h1 className="text-primary-text text-3xl font-bold text-center mb-1">Crie sua conta médica</h1>
                            <h3 className="text-center mb-1 text-text-secondary">Junte-se a milhares de profissionais...</h3>
                        </div>
                        
                        <form onSubmit={handleFormSubmit} className="relative min-h-105 w-full">
                            {currentStep === 1 && (
                                <div className="flex flex-col gap-5 animate-appearance-in">
                                    
                                    <FieldWrapper 
                                    label="Nome" 
                                    >
                                        <Input 
                                        id="name" 
                                        value={formData.name} 
                                        onChange={handleInputChange} 
                                        className={`w-full border rounded p-2 transition-colors ${
                                            errors.name ? 'border-danger text-danger' : 'border-default-200'
                                                }`}
                                        />
                                    </FieldWrapper>

                                    <FieldWrapper 
                                    label="Email" 
                                    >
                                        <Input 
                                        id="email" 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={handleInputChange} 
                                        className={`w-full border rounded p-2 transition-colors ${
                                                errors.email ? 'border-danger text-danger' : 'border-default-200'
                                            }`}
                                         />
                                    </FieldWrapper>

                                    <PasswordInput
                                        id="password"
                                        label="Senha"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        hasError={!!errors.password}
                                    />

                                    <FieldWrapper label="Confirmar Senha">
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
                                            className={`w-full border rounded p-2 transition-colors ${
                                                errors.confirmPassword ? 'border-danger text-danger' : 'border-default-200'
                                            }`}
                                        />
                                    </FieldWrapper>

                                    <Button 
                                    variant="primary" 
                                    size="lg" 
                                    className="w-full mt-2 font-medium" 
                                    onClick={handleStateChange}>
                                        <div className="flex items-center justify-center gap-2">
                                            Próximo
                                        </div>
                                    </Button>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="flex flex-col gap-5 animate-appearance-in">
                                  <FieldWrapper label="UF e CRM">
                                    <div className="flex gap-3 h-10">
                                        <div className={`relative w-1/3 flex items-center border-2 rounded-xl transition-colors bg-surface ${
                                                'border-border focus-within:border-primary-hover'
                                            }`}>
                                            <select
                                                aria-label="Estado do CRM"
                                                value={formData.state}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, state: e.target.value });
                                                    if (errors.state) {
                                                        setErrors((prev) => {
                                                            const newErrors = { ...prev };
                                                            delete newErrors.state;
                                                            return newErrors;
                                                        });
                                                    }
                                                }}
                                                className="w-full h-full px-3 bg-transparent outline-none text-text-primary text-sm cursor-pointer appearance-none z-10"
                                            >
                                                {states.map((state) => (
                                                    <option key={state.value} value={state.value} className="bg-surface text-text-primary">
                                                        {state.value}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 pointer-events-none text-text-muted">
                                                <ChevronDown />
                                            </div>
                                        </div>
                                        <Input
                                            id="crm"
                                            placeholder="Digite o CRM"
                                            className={`w-full border rounded p-2 transition-colors ${
                                                errors.email ? 'border-danger text-danger' : 'border-default-200'
                                            }`}
                                            value={formData.crm}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </FieldWrapper>

                                    <FieldWrapper label="RQE">
                                        <Input 
                                        id="rqe"
                                        value={formData.rqe}
                                        onChange={handleInputChange}
                                        className={`w-full border rounded p-2 transition-colors ${
                                            errors.rqe ? 'border-danger text-danger' : 'border-default-200'
                                        }`} />
                                    </FieldWrapper>

                                    <FieldWrapper label="CPF">
                                        <Input 
                                        id="cpf"
                                        value={formData.cpf}
                                        onChange={handleInputChange}
                                        className={`w-full border rounded p-2 transition-colors ${
                                            errors.cpf ? 'border-danger text-danger' : 'border-default-200'
                                        }`} />
                                    </FieldWrapper>

                                    <div className="flex gap-4 mt-2">
                                        <Button 
                                        variant="outline" 
                                        size="lg" 
                                        className="w-1/2 font-medium" 
                                        onClick={() => setCurrentStep(1)}>
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
                        <a href="/login/" className="text-sm text-center text-primary mt-2 hover:underline">
                            já tem uma conta? faça login
                        </a>
                    </div>
                </div>

                <div className="hidden md:flex md:w-1/2 relative bg-surface-alt items-center justify-center overflow-hidden">
                    
                    <div className="absolute w-[150%] h-[150%] bg-linear-to-br from-primary-color/10 via-accent-subtle/40 to-transparent rounded-full -top-20 -right-20 z-0 animate-pulse-slow"></div>
                    
                    <FloatingCard 
                        className="top-20 left-10 delay-100"
                        icon="⭐"
                        title="4.9/5"
                        subtitle="Avaliação Média dos Pacientes"
                    />

                    <FloatingCard 
                        className="bottom-32 right-10 delay-300"
                        icon="📅"
                        title="+10k"
                        subtitle="Consultas Agendadas"
                    />

                    <img 
                        src={doctorImage} 
                        alt="Médica usando tablet" 
                        className="h-[90%] w-auto object-contain relative z-10 drop-shadow-2xl" 
                    />
                </div>
            
            </div>
        </>
    )
}
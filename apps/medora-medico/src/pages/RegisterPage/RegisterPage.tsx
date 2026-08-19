import { useState } from "react";
import { Input, Button, toast, ToastProvider } from "@heroui/react";
import { FloatingCard, FormStepper, PasswordInput, FieldWrapper } from "@medora_web/shared";
import doctorImage from '../../assets/medicoSegurandoTable.png';
import type { RegisterDoctorDto } from "../../api/dtos/RegisterDoctorDto";
import { Endpoints } from "../../api/enums/endpoints";
import { Activity, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";
import RejectedVerificationDialog from "../../components/RejectedVerificationDialog/RejectedVerificationDialog";

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

    const [isRejectedOpen, setIsRejectedOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const navigate = useNavigate();

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

    const handleNextStep = () => {
        const newErrors: Record<string, string> = {};

        // if (formData.name === '')
        //     newErrors.name = 'Nome é obrigatório';
        // if (formData.email === '' || !/\S+@\S+\.\S+/.test(formData.email))
        //     newErrors.email = 'E-mail válido é obrigatório';
        // if (formData.password === '' || formData.password.length < 6)
        //     newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        // if (confirmPassword === '' || confirmPassword !== formData.password)
        //     newErrors.confirmPassword = 'As senhas devem coincidir';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.warning(Object.values(newErrors)[0]);
            return;
        }

        setErrors({});
        setCurrentStep(2);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        // if (formData.state === '')
        //     newErrors.state = 'Estado é obrigatório';
        // if (formData.crm === '')
        //     newErrors.crm = 'CRM é obrigatório';
        // if (formData.rqe === '')
        //     newErrors.rqe = 'RQE é obrigatório';
        // if (formData.cpf === '')
        //     newErrors.cpf = 'CPF é obrigatório';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.warning(Object.values(newErrors)[0]);
            return;
        }

        try {
            const response = await fetch(Endpoints.REGISTER_DOCTOR, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            navigate("/verificar-email/");
            // if (response.ok) {
            //     toast.success('Cadastro realizado com sucesso!');
                
            // } else {
            //     const data = await response
            //         .json()
            //         .catch(() => ({ reason: "Não foi possível validar seus dados." }));
            //     setRejectionReason(data.reason);
            //     setIsRejectedOpen(true);
            // }
        } catch (error) {
            console.error('Erro ao registrar médico:', error);
            toast.warning('Erro de conexão. Tente novamente.');
        }
    };

    return (
        <>
            <ToastProvider />
            <RejectedVerificationDialog
                isOpen={isRejectedOpen}
                reason={rejectionReason}
                onReview={() => setIsRejectedOpen(false)}
            />

            <div className="flex flex-col md:flex-row w-full max-w-7xl h-fit md:h-[90vh] bg-surface rounded-2xl shadow-2xl overflow-hidden m-4 border border-border mx-auto">

                <div className="w-full md:w-1/2 flex justify-center items-center p-8 sm:p-12 lg:p-16 relative z-10">
                    <div className="w-full max-w-md flex flex-col gap-5">

                        <div className="flex items-center justify-center gap-3 mb-1">
                            <Activity size={32} color="var(--primary)" strokeWidth={1.5} />
                            <span className="text-primary-text text-2xl font-bold tracking-tight">Medora</span>
                        </div>

                        <FormStepper currentStep={currentStep} />

                        <div className="text-center">
                            <h2 className="text-primary-text text-2xl font-bold mb-1">
                                {currentStep === 1 ? 'Crie sua conta' : 'Dados profissionais'}
                            </h2>
                            <p className="text-text-secondary text-sm">
                                {currentStep === 1
                                    ? 'Preencha seus dados de acesso para continuar'
                                    : 'Informe seu registro profissional para validação'}
                            </p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="relative min-h-105 w-full">

                            {currentStep === 1 && (
                                <div className="flex flex-col gap-4 animate-appearance-in">

                                    <FieldWrapper label="Nome completo">
                                        <Input
                                            id="name"
                                            placeholder="Seu nome"
                                            defaultValue="João Silva"
                                            onChange={handleInputChange}
                                            autoComplete="off" 
                                            className={`w-full border rounded-lg p-2 transition-colors ${errors.name ? 'border-danger' : 'border-default-200'}`}
                                        />
                                    </FieldWrapper>

                                    <FieldWrapper label="E-mail">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            defaultValue="joaosilva@gmail.com"
                                            autoComplete="off"
                                            onChange={handleInputChange}
                                            className={`w-full border rounded-lg p-2 transition-colors ${errors.email ? 'border-danger' : 'border-default-200'}`}
                                        />
                                    </FieldWrapper>

                                    <PasswordInput
                                        id="password"
                                        label="Senha"
                                        value="SenhaForte123!"
                                        onChange={handleInputChange}
                                        hasError={!!errors.password}
                                    />

                                    <FieldWrapper label="Confirmar senha">
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            autoComplete="off" 
                                            placeholder="Repita a senha"
                                            value="SenhaForte123!"
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (errors.confirmPassword) {
                                                    setErrors(prev => {
                                                        const next = { ...prev };
                                                        delete next.confirmPassword;
                                                        return next;
                                                    });
                                                }
                                            }}
                                            className={`w-full border rounded-lg p-2 transition-colors ${errors.confirmPassword ? 'border-danger' : 'border-default-200'}`}
                                        />
                                    </FieldWrapper>

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full mt-1 font-semibold rounded-md"
                                        onClick={handleNextStep}
                                    >
                                        Continuar
                                    </Button>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="flex flex-col gap-4 animate-appearance-in">

                                    <FieldWrapper label="UF e CRM">
                                        <div className="flex gap-3 h-10">
                                            <div className={`relative w-1/3 flex items-center border border-border rounded-lg transition-colors bg-surface focus-within:border-primary-hover`}>
                                                <select
                                                    aria-label="Estado do CRM"
                                                    value={formData.state}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, state: e.target.value });
                                                        if (errors.state) {
                                                            setErrors((prev) => {
                                                                const next = { ...prev };
                                                                delete next.state;
                                                                return next;
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
                                                <div className="absolute right-2.5 pointer-events-none text-text-muted">
                                                    <ChevronDown size={14} />
                                                </div>
                                            </div>

                                            <Input
                                                id="crm"
                                                placeholder="Número do CRM"
                                                className={`w-full border rounded-lg p-2 transition-colors ${errors.crm ? 'border-danger' : 'border-default-200'}`}
                                                value="123456"
                                                autoComplete="off"
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </FieldWrapper>

                                    <FieldWrapper label="RQE">
                                        <Input
                                            id="rqe"
                                            placeholder="Número do RQE"
                                            value="78910"
                                            autoComplete="off" 
                                            onChange={handleInputChange}
                                            className={`w-full border rounded-lg p-2 transition-colors ${errors.rqe ? 'border-danger' : 'border-default-200'}`}
                                        />
                                    </FieldWrapper>

                                    <FieldWrapper label="CPF">
                                        <Input
                                            id="cpf"
                                            placeholder="000.000.000-00"
                                            value="123.456.789-10"
                                            autoComplete="off" 
                                            onChange={handleInputChange}
                                            className={`w-full border rounded-lg p-2 transition-colors ${errors.cpf ? 'border-danger' : 'border-default-200'}`}
                                        />
                                    </FieldWrapper>

                                    <div className="flex gap-3 mt-1">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-1/3 font-medium rounded-md border-border text-text-secondary hover:text-text-primary"
                                            onClick={() => setCurrentStep(1)}
                                        >
                                            Voltar
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            type="submit"
                                            className="w-2/3 font-semibold rounded-md"
                                        >
                                            Finalizar cadastro
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="flex items-center justify-center gap-2 pt-1">
                            <span className="text-sm text-text-muted">Já tem uma conta?</span>
                            <a
                                href="/login/"
                                className="text-sm font-medium text-primary hover:text-primary-hover underline underline-offset-2 transition-colors"
                            >
                                Fazer login
                            </a>
                        </div>

                    </div>
                </div>

                <div className="hidden md:flex md:w-1/2 relative bg-surface-alt items-center justify-center overflow-hidden">

                    <div className="absolute w-[150%] h-[150%] bg-linear-to-br from-primary-color/10 via-accent-subtle/40 to-transparent rounded-full -top-20 -right-20 z-0 animate-pulse-slow" />

                    <FloatingCard
                        className="top-20 left-10 delay-100"
                        icon="⭐"
                        title="4.9/5"
                        subtitle="Avaliação média dos pacientes"
                    />

                    <FloatingCard
                        className="bottom-32 right-10 delay-300"
                        icon="📅"
                        title="+10 mil"
                        subtitle="Consultas agendadas"
                    />

                    <img
                        src={doctorImage}
                        alt="Médica segurando tablet"
                        className="h-[90%] w-auto object-contain relative z-10 drop-shadow-2xl"
                    />
                </div>

            </div>
        </>
    );
}

import { useState } from "react";
import { Input, Button, toast, ToastProvider } from "@heroui/react";
import { FloatingCard, FormStepper, PasswordInput, FieldWrapper } from "@medora_web/shared";
import doctorImage from '../../assets/medicoSegurandoTable.png';
import type { RegisterDoctorDto, ForeignerDto } from "../../api/dtos/RegisterDoctorDto";
import { Endpoints } from "../../api/enums/endpoints";
import { registerDoctor } from "../../api/services/DoctorService";
import { Activity, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";
import RejectedVerificationDialog from "../../components/RejectedVerificationDialog/RejectedVerificationDialog";

const TOTAL_STEPS = 3;

type FormState = Omit<RegisterDoctorDto, 'birthDate' | 'foreigner'> & {
    birthDate: string;
    foreigner: Omit<ForeignerDto, 'naturalizationDate' | 'passportIssueDate' | 'passportExpirationDate'> & {
        naturalizationDate: string;
        passportIssueDate: string;
        passportExpirationDate: string;
    } | null;
};

const initialFormData: FormState = {
    email: '',
    password: '',
    fullName: '',
    nationality: 'BR',
    birthDate: '',
    sex: 1,
    race: 1,
    phone: '',
    cpf: undefined,
    gender: undefined,
    isMotherUnknown: undefined,
    mothersName: undefined,
    crm: '',
    crmState: 'PR',
    foreigner: null,
};

const states = [
    { label: 'Acre (AC)', value: 'AC' },
    { label: 'Alagoas (AL)', value: 'AL' },
    { label: 'Amapá (AP)', value: 'AP' },
    { label: 'Amazonas (AM)', value: 'AM' },
    { label: 'Bahia (BA)', value: 'BA' },
    { label: 'Ceará (CE)', value: 'CE' },
    { label: 'Distrito Federal (DF)', value: 'DF' },
    { label: 'Espírito Santo (ES)', value: 'ES' },
    { label: 'Goiás (GO)', value: 'GO' },
    { label: 'Maranhão (MA)', value: 'MA' },
    { label: 'Mato Grosso (MT)', value: 'MT' },
    { label: 'Mato Grosso do Sul (MS)', value: 'MS' },
    { label: 'Minas Gerais (MG)', value: 'MG' },
    { label: 'Pará (PA)', value: 'PA' },
    { label: 'Paraíba (PB)', value: 'PB' },
    { label: 'Paraná (PR)', value: 'PR' },
    { label: 'Pernambuco (PE)', value: 'PE' },
    { label: 'Piauí (PI)', value: 'PI' },
    { label: 'Rio de Janeiro (RJ)', value: 'RJ' },
    { label: 'Rio Grande do Norte (RN)', value: 'RN' },
    { label: 'Rio Grande do Sul (RS)', value: 'RS' },
    { label: 'Rondônia (RO)', value: 'RO' },
    { label: 'Roraima (RR)', value: 'RR' },
    { label: 'Santa Catarina (SC)', value: 'SC' },
    { label: 'São Paulo (SP)', value: 'SP' },
    { label: 'Sergipe (SE)', value: 'SE' },
    { label: 'Tocantins (TO)', value: 'TO' },
];

const sexOptions = [
    { label: 'Masculino', value: 1 },
    { label: 'Feminino', value: 1 },
];

const raceOptions = [
    { label: 'Branca', value: 1 },
    { label: 'Preta', value: 2 },
    { label: 'Parda', value: 3 },
    { label: 'Amarela', value: 4 },
    { label: 'Indígena', value: 5 },
];

type ForeignerFormFields = NonNullable<FormState['foreigner']>;

const emptyForeigner: ForeignerFormFields = {
    birthCountry: '',
    naturalizationDate: '',
    passportNumber: '',
    passportIssuerCountry: '',
    passportIssueDate: '',
    passportExpirationDate: '',
};

export function RegisterPage() {
    const [formData, setFormData] = useState<FormState>(initialFormData);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isForeigner, setIsForeigner] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = useState(1);

    const [isRejectedOpen, setIsRejectedOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const navigate = useNavigate();

    const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field as string]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field as string];
                return next;
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setField(id as keyof FormState, value as never);
    };

    const setForeignerField = (field: keyof ForeignerFormFields, value: string) => {
        setFormData((prev) => {
            const nextForeigner: ForeignerFormFields = {
                ...(prev.foreigner ?? emptyForeigner),
            };
            nextForeigner[field] = value;
            return { ...prev, foreigner: nextForeigner };
        });
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'E-mail válido é obrigatório';
        if (formData.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        if (confirmPassword !== formData.password) newErrors.confirmPassword = 'As senhas devem coincidir';
        return newErrors;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Nome é obrigatório';
        if (!formData.birthDate) newErrors.birthDate = 'Data de nascimento é obrigatória';
        if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
        if (!formData.sex) newErrors.sex = 'Sexo é obrigatório';
        if (!formData.race) newErrors.race = 'Raça/cor é obrigatória';
        if (isForeigner) {
            const f = formData.foreigner;
            if (!f?.birthCountry) newErrors.birthCountry = 'País de nascimento é obrigatório';
            if (!f?.passportNumber) newErrors.passportNumber = 'Número do passaporte é obrigatório';
            if (!f?.passportIssueDate) newErrors.passportIssueDate = 'Data de emissão é obrigatória';
            if (!f?.passportExpirationDate) newErrors.passportExpirationDate = 'Validade é obrigatória';
        } else if (!formData.cpf) {
            newErrors.cpf = 'CPF é obrigatório';
        }
        return newErrors;
    };

    const validateStep3 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.crm.trim()) newErrors.crm = 'CRM é obrigatório';
        if (!formData.crmState) newErrors.crmState = 'Estado do CRM é obrigatório';
        return newErrors;
    };

    const goToStep = (step: number, validate: () => Record<string, string>) => {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.warning(Object.values(newErrors)[0]);
            return;
        }
        setErrors({});
        setCurrentStep(step);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = validateStep3();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.warning(Object.values(newErrors)[0]);
            return;
        }

        const payload: RegisterDoctorDto = {
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            nationality: isForeigner ? formData.nationality : 'BR',
            birthDate: formData.birthDate,
            sex: formData.sex,
            race: formData.race,
            phone: formData.phone,
            cpf: formData.cpf || undefined,
            gender: formData.gender || undefined,
            isMotherUnknown: formData.isMotherUnknown,
            mothersName: formData.mothersName || undefined,
            crm: formData.crm,
            crmState: formData.crmState,
            foreigner: isForeigner && formData.foreigner ? {
                birthCountry: formData.foreigner.birthCountry,
                naturalizationDate: formData.foreigner.naturalizationDate
                    ? new Date(formData.foreigner.naturalizationDate)
                    : undefined,
                passportNumber: formData.foreigner.passportNumber,
                passportIssuerCountry: formData.foreigner.passportIssuerCountry,
                passportIssueDate: new Date(formData.foreigner.passportIssueDate),
                passportExpirationDate: new Date(formData.foreigner.passportExpirationDate),
            } : undefined,
        };

        try {
            const result = await registerDoctor(payload);
            toast.success('Cadastro realizado com sucesso!');
            navigate("/verify-email", { state: { userId: result.userId } });
        } catch (error) {
            console.error('Erro ao registrar médico:', error);
            toast.warning(error instanceof Error ? error.message : 'Erro de conexão. Tente novamente.');

        }
    };

    const stepTitles: Record<number, { title: string; subtitle: string }> = {
        1: { title: 'Crie sua conta', subtitle: 'Preencha seus dados de acesso para continuar' },
        2: { title: 'Dados pessoais', subtitle: 'Precisamos confirmar quem é você' },
        3: { title: 'Dados profissionais', subtitle: 'Informe seu registro profissional para validação' },
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

                        <FormStepper currentStep={currentStep} totalSteps={TOTAL_STEPS} />

                        <div className="text-center">
                            <h2 className="text-primary-text text-2xl font-bold mb-1">{stepTitles[currentStep].title}</h2>
                            <p className="text-text-secondary text-sm">{stepTitles[currentStep].subtitle}</p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="relative min-h-105 w-full">

                            {currentStep === 1 && (
                                <div className="flex flex-col gap-4 animate-appearance-in">
                                    <FieldWrapper label="E-mail">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={formData.email}
                                            autoComplete="off"
                                            onChange={handleInputChange}
                                            className={`w-full border rounded-lg p-2 transition-colors ${errors.email ? 'border-danger' : 'border-default-200'}`}
                                        />
                                    </FieldWrapper>

                                    <PasswordInput
                                        id="password"
                                        label="Senha"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        hasError={!!errors.password}
                                    />

                                    <FieldWrapper label="Confirmar senha">
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            autoComplete="off"
                                            placeholder="Repita a senha"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (errors.confirmPassword) {
                                                    setErrors((prev) => {
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
                                        onClick={() => goToStep(2, validateStep1)}
                                    >
                                        Continuar
                                    </Button>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="flex flex-col gap-4 animate-appearance-in">
                                    <FieldWrapper label="Nome completo">
                                        <Input
                                            id="fullName"
                                            placeholder="Seu nome"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                            className={`w-full border rounded-lg p-2 transition-colors ${errors.fullName ? 'border-danger' : 'border-default-200'}`}
                                        />
                                    </FieldWrapper>

                                    <div className="flex gap-3">
                                        <div className="w-1/2">
                                            <FieldWrapper label="Data de nascimento">
                                                <Input
                                                    id="birthDate"
                                                    type="date"
                                                    value={formData.birthDate}
                                                    onChange={handleInputChange}
                                                    className={`w-full border rounded-lg p-2 transition-colors ${errors.birthDate ? 'border-danger' : 'border-default-200'}`}
                                                />
                                            </FieldWrapper>
                                        </div>

                                        <div className="w-1/2">
                                            <FieldWrapper label="Telefone">
                                                <Input
                                                    id="phone"
                                                    placeholder="(00) 00000-0000"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    autoComplete="off"
                                                    className={`w-full border rounded-lg p-2 transition-colors ${errors.phone ? 'border-danger' : 'border-default-200'}`}
                                                />
                                            </FieldWrapper>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-1/2">
                                            <FieldWrapper label="Sexo">
                                                <select
                                                    value={formData.sex}
                                                    onChange={(e) => setField('sex', Number(e.target.value))}
                                                    className={`w-full h-10 px-3 border rounded-lg bg-surface text-text-primary text-sm ${errors.sex ? 'border-danger' : 'border-border'}`}
                                                >
                                                    <option value="" disabled>Selecione</option>
                                                    {sexOptions.map((o) => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                            </FieldWrapper>
                                        </div>

                                        <div className="w-1/2">
                                            <FieldWrapper label="Raça/Cor">
                                                <select
                                                    value={formData.race}
                                                    onChange={(e) => setField('race', Number(e.target.value))}
                                                    className={`w-full h-10 px-3 border rounded-lg bg-surface text-text-primary text-sm ${errors.race ? 'border-danger' : 'border-border'}`}
                                                >
                                                    <option value="" disabled>Selecione</option>
                                                    {raceOptions.map((o) => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                            </FieldWrapper>
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2 text-sm text-text-secondary">
                                        <input
                                            type="checkbox"
                                            checked={isForeigner}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setIsForeigner(checked);
                                                setField('foreigner', checked ? emptyForeigner : null);
                                                if (checked) setField('cpf', undefined);
                                            }}
                                        />
                                        Sou estrangeiro(a)
                                    </label>

                                    {!isForeigner && (
                                        <FieldWrapper label="CPF">
                                            <Input
                                                id="cpf"
                                                placeholder="000.000.000-00"
                                                value={formData.cpf ?? ''}
                                                autoComplete="off"
                                                onChange={handleInputChange}
                                                className={`w-full border rounded-lg p-2 transition-colors ${errors.cpf ? 'border-danger' : 'border-default-200'}`}
                                            />
                                        </FieldWrapper>
                                    )}

                                    {isForeigner && (
                                        <div className="flex flex-col gap-4 border-t border-border pt-4 animate-appearance-in">
                                            <FieldWrapper label="País de nascimento">
                                                <Input
                                                    placeholder="Ex: Portugal"
                                                    value={formData.foreigner?.birthCountry ?? ''}
                                                    onChange={(e) => setForeignerField('birthCountry', e.target.value)}
                                                    className={`w-full border rounded-lg p-2 transition-colors ${errors.birthCountry ? 'border-danger' : 'border-default-200'}`}
                                                />
                                            </FieldWrapper>

                                            <div className="flex gap-3">
                                                <div className="w-1/2">
                                                    <FieldWrapper label="Nº do passaporte">
                                                        <Input
                                                            value={formData.foreigner?.passportNumber ?? ''}
                                                            onChange={(e) => setForeignerField('passportNumber', e.target.value)}
                                                            className={`w-full border rounded-lg p-2 transition-colors ${errors.passportNumber ? 'border-danger' : 'border-default-200'}`}
                                                        />
                                                    </FieldWrapper>
                                                </div>
                                                <div className="w-1/2">
                                                    <FieldWrapper label="País emissor">
                                                        <Input
                                                            value={formData.foreigner?.passportIssuerCountry ?? ''}
                                                            onChange={(e) => setForeignerField('passportIssuerCountry', e.target.value)}
                                                            className="w-full border rounded-lg p-2 border-default-200"
                                                        />
                                                    </FieldWrapper>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <div className="w-1/2">
                                                    <FieldWrapper label="Emissão">
                                                        <Input
                                                            type="date"
                                                            value={formData.foreigner?.passportIssueDate ?? ''}
                                                            onChange={(e) => setForeignerField('passportIssueDate', e.target.value)}
                                                            className={`w-full border rounded-lg p-2 transition-colors ${errors.passportIssueDate ? 'border-danger' : 'border-default-200'}`}
                                                        />
                                                    </FieldWrapper>
                                                </div>
                                                <div className="w-1/2">
                                                    <FieldWrapper label="Validade">
                                                        <Input
                                                            type="date"
                                                            value={formData.foreigner?.passportExpirationDate ?? ''}
                                                            onChange={(e) => setForeignerField('passportExpirationDate', e.target.value)}
                                                            className={`w-full border rounded-lg p-2 transition-colors ${errors.passportExpirationDate ? 'border-danger' : 'border-default-200'}`}
                                                        />
                                                    </FieldWrapper>
                                                </div>
                                            </div>
                                        </div>
                                    )}

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
                                            className="w-2/3 font-semibold rounded-md"
                                            onClick={() => goToStep(3, validateStep2)}
                                        >
                                            Continuar
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="flex flex-col gap-4 animate-appearance-in">
                                    <FieldWrapper label="UF e CRM">
                                        <div className="flex gap-3 h-10">
                                            <div className="relative w-1/3 flex items-center border border-border rounded-lg transition-colors bg-surface focus-within:border-primary-hover">
                                                <select
                                                    aria-label="Estado do CRM"
                                                    value={formData.crmState}
                                                    onChange={(e) => setField('crmState', e.target.value)}
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
                                                value={formData.crm}
                                                autoComplete="off"
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </FieldWrapper>

                                    <div className="flex gap-3 mt-1">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-1/3 font-medium rounded-md border-border text-text-secondary hover:text-text-primary"
                                            onClick={() => setCurrentStep(2)}
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

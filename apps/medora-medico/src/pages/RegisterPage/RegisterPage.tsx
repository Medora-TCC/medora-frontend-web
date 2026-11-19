import { useState } from "react";
import type { ChangeEvent, ClipboardEvent, FormEvent } from "react";
import { Input, Button, toast, ToastProvider } from "@heroui/react";
import { FloatingCard, FormStepper, PasswordInput, FieldWrapper } from "@medora_web/shared";
import doctorImage from '../../assets/medicoSegurandoTable.png';
import type { RegisterDoctorDto } from "../../api/dtos/Doctors/RegisterDoctorDto";
import { registerDoctor } from "../../api/services/DoctorService";
import { Activity, ChevronDown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import RejectedVerificationDialog from "../../components/RejectedVerificationDialog/RejectedVerificationDialog";
import {
    isValidCpf,
    isValidPhone,
    maskCpf,
    maskCrm,
    maskPassport,
    maskPhone,
    normalizePhonePaste,
    onlyDigits,
} from "../../utils/masks";

const TOTAL_STEPS = 4;

type ForeignerForm = {
    birthCountry: string;
    naturalizationDate: string;
    passportNumber: string;
    passportIssuerCountry: string;
    passportIssueDate: string;
    passportExpirationDate: string;
};

type FormState = Omit<RegisterDoctorDto, 'foreigner'> & {
    foreigner: ForeignerForm | null;
};

type Errors = Record<string, string>;
type MaskedField = 'cpf' | 'phone' | 'crm';

const emptyForeigner: ForeignerForm = {
    birthCountry: '',
    naturalizationDate: '',
    passportNumber: '',
    passportIssuerCountry: '',
    passportIssueDate: '',
    passportExpirationDate: '',
};

const initialFormData: FormState = {
    email: '',
    password: '',
    fullName: '',
    nationality: 'BR',
    birthDate: '',
    sex: 0,   // 0 = não selecionado (obriga o usuário a escolher)
    race: 0,  // 0 = não selecionado
    phone: '',
    cpf: '',
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
    { label: 'Feminino', value: 2 },
];

const raceOptions = [
    { label: 'Branca', value: 1 },
    { label: 'Preta', value: 2 },
    { label: 'Parda', value: 3 },
    { label: 'Amarela', value: 4 },
    { label: 'Indígena', value: 5 },
];

const passwordRules = [
    { id: 'length', label: 'Mínimo de 8 caracteres', validate: (v: string) => v.length >= 8 },
    { id: 'uppercase', label: 'Contenha 1 letra maiúscula ABC', validate: (v: string) => /[A-Z]/.test(v) },
    { id: 'lowercase', label: 'Contenha 1 letra minúscula abc', validate: (v: string) => /[a-z]/.test(v) },
    { id: 'number', label: 'Contenha 1 número 123', validate: (v: string) => /[0-9]/.test(v) },
    { id: 'special', label: 'Contenha 1 caractere especial !@#$%', validate: (v: string) => /[^a-zA-Z0-9]/.test(v) },
];

const stepTitles: Record<number, { title: string; subtitle: string }> = {
    1: { title: 'Crie sua conta', subtitle: 'Defina seu e-mail e senha de acesso' },
    2: { title: 'Dados pessoais', subtitle: 'Conte-nos quem é você e como podemos falar com você' },
    3: { title: 'Documentos', subtitle: 'Usamos seu documento para confirmar sua identidade' },
    4: { title: 'Dados profissionais', subtitle: 'Informe seu CRM para validarmos seu registro' },
};

const inputClass = (hasError: boolean) =>
    `w-full border rounded-lg p-2 transition-colors ${hasError ? 'border-danger' : 'border-default-200'}`;

const selectClass = (hasError: boolean) =>
    `w-full h-10 px-3 border rounded-lg bg-surface text-text-primary text-sm ${hasError ? 'border-danger' : 'border-border'}`;

const todayISO = () => new Date().toISOString().slice(0, 10);

function getBirthDateError(value: string): string | null {
    if (!value) return 'Informe sua data de nascimento';
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime()) || date.getFullYear() < 1900) return 'Data de nascimento inválida';

    const today = new Date();
    if (date > today) return 'A data de nascimento não pode estar no futuro';

    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) age--;
    if (age < 18) return 'É necessário ter 18 anos ou mais para se cadastrar';
    return null;
}

export function RegisterPage() {
    const [formData, setFormData] = useState<FormState>(initialFormData);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isForeigner, setIsForeigner] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [currentStep, setCurrentStep] = useState(1);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isRejectedOpen, setIsRejectedOpen] = useState(false);
    const [rejectionReason] = useState("");

    const navigate = useNavigate();

    const clearError = (key: string) => {
        setErrors((prev) => {
            if (!(key in prev)) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        clearError(field as string);
    };

    const setForeignerField = (field: keyof ForeignerForm, value: string) => {
        setFormData((prev) => ({
            ...prev,
            foreigner: { ...(prev.foreigner ?? emptyForeigner), [field]: value },
        }));
        clearError(field);
    };

    const handleNationalityChange = (foreigner: boolean) => {
        setIsForeigner(foreigner);
        setFormData((prev) => ({
            ...prev,
            cpf: foreigner ? '' : prev.cpf,
            nationality: foreigner ? '' : 'BR',
            foreigner: foreigner ? (prev.foreigner ?? emptyForeigner) : null,
        }));
        setErrors({});
    };

    const maskedChange =
        (field: MaskedField, mask: (v: string) => string) =>
        (e: ChangeEvent<HTMLInputElement>) =>
            setField(field, mask(e.target.value));

    const maskedPaste =
        (field: MaskedField, mask: (v: string) => string, normalize: (v: string) => string = (v) => v) =>
        (e: ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();
            setField(field, mask(normalize(e.clipboardData.getData('text'))));
        };

    const validateAccount = (): Errors => {
        const next: Errors = {};
        if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) next.email = 'Informe um e-mail válido. Ex.: nome@email.com';
        if (!passwordRules.every((rule) => rule.validate(formData.password))) next.password = 'A senha deve atender a todos os requisitos listados';
        if (!confirmPassword) next.confirmPassword = 'Repita a senha para confirmar';
        else if (confirmPassword !== formData.password) next.confirmPassword = 'As senhas não coincidem';
        return next;
    };

    const validatePersonal = (): Errors => {
        const next: Errors = {};
        if (formData.fullName.trim().split(/\s+/).filter(Boolean).length < 2) {
            next.fullName = 'Informe seu nome completo (nome e sobrenome)';
        }
        const birthError = getBirthDateError(formData.birthDate);
        if (birthError) next.birthDate = birthError;
        if (!formData.phone) next.phone = 'Informe seu telefone com DDD';
        else if (!isValidPhone(formData.phone)) next.phone = 'Telefone inválido. Use o formato (00) 00000-0000';
        if (!formData.sex) next.sex = 'Selecione uma opção';
        if (!formData.race) next.race = 'Selecione uma opção';
        return next;
    };

    const validateDocuments = (): Errors => {
        const next: Errors = {};
        if (!isForeigner) {
            if (!formData.cpf) next.cpf = 'Informe seu CPF';
            else if (!isValidCpf(formData.cpf)) next.cpf = 'CPF inválido. Confira os 11 números';
            return next;
        }

        const f = formData.foreigner ?? emptyForeigner;
        const today = todayISO();
        if (!/^[A-Z]{2}$/.test(formData.nationality)) next.nationality = 'Informe o código do país com 2 letras. Ex.: PT';
        else if (formData.nationality === 'BR') next.nationality = 'Para brasileiros, selecione "Brasileiro(a)"';
        if (!f.birthCountry.trim()) next.birthCountry = 'Informe o país de nascimento';
        if (!f.passportNumber.trim()) next.passportNumber = 'Informe o número do passaporte';
        if (!f.passportIssuerCountry.trim()) next.passportIssuerCountry = 'Informe o país emissor';

        if (!f.passportIssueDate) next.passportIssueDate = 'Informe a data de emissão';
        else if (f.passportIssueDate > today) next.passportIssueDate = 'A emissão não pode estar no futuro';

        if (!f.passportExpirationDate) next.passportExpirationDate = 'Informe a data de validade';
        else if (f.passportExpirationDate <= today) next.passportExpirationDate = 'O passaporte está vencido';
        else if (f.passportIssueDate && f.passportExpirationDate <= f.passportIssueDate) {
            next.passportExpirationDate = 'A validade deve ser posterior à emissão';
        }

        if (f.naturalizationDate && f.naturalizationDate > today) {
            next.naturalizationDate = 'A data de naturalização não pode estar no futuro';
        }
        return next;
    };

    const validateProfessional = (): Errors => {
        const next: Errors = {};
        if (!formData.crmState) next.crmState = 'Selecione o estado do CRM';
        if (!formData.crm) next.crm = 'Informe o número do CRM';
        else if (formData.crm.length < 4) next.crm = 'CRM inválido. Confira o número';
        return next;
    };

    const stepValidators = [validateAccount, validatePersonal, validateDocuments, validateProfessional];

    const showErrors = (stepErrors: Errors, step: number) => {
        setErrors(stepErrors);
        setCurrentStep(step);
        const firstKey = Object.keys(stepErrors)[0];
        requestAnimationFrame(() => document.getElementById(firstKey)?.focus());
    };

    const goNext = () => {
        const stepErrors = stepValidators[currentStep - 1]();
        if (Object.keys(stepErrors).length > 0) {
            showErrors(stepErrors, currentStep);
            return;
        }
        setErrors({});
        setCurrentStep((step) => Math.min(step + 1, TOTAL_STEPS));
    };

    const goBack = () => {
        setErrors({});
        setCurrentStep((step) => Math.max(step - 1, 1));
    };

    const buildPayload = (): RegisterDoctorDto => ({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        fullName: formData.fullName.trim().replace(/\s+/g, ' '),
        nationality: isForeigner ? formData.nationality.trim().toUpperCase() : 'BR',
        birthDate: formData.birthDate,
        sex: formData.sex,
        race: formData.race,
        phone: onlyDigits(formData.phone),
        cpf: !isForeigner && formData.cpf ? onlyDigits(formData.cpf) : undefined,
        gender: formData.gender || undefined,
        isMotherUnknown: formData.isMotherUnknown,
        mothersName: formData.mothersName || undefined,
        crm: onlyDigits(formData.crm),
        crmState: formData.crmState,
        foreigner:
            isForeigner && formData.foreigner
                ? {
                      birthCountry: formData.foreigner.birthCountry.trim(),
                      naturalizationDate: formData.foreigner.naturalizationDate || undefined,
                      passportNumber: formData.foreigner.passportNumber.trim(),
                      passportIssuerCountry: formData.foreigner.passportIssuerCountry.trim(),
                      passportIssueDate: formData.foreigner.passportIssueDate,
                      passportExpirationDate: formData.foreigner.passportExpirationDate,
                  }
                : undefined,
    });

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (currentStep < TOTAL_STEPS) {
            goNext();
            return;
        }

        for (let i = 0; i < stepValidators.length; i++) {
            const stepErrors = stepValidators[i]();
            if (Object.keys(stepErrors).length > 0) {
                showErrors(stepErrors, i + 1);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const result = await registerDoctor(buildPayload());
            toast.success('Cadastro recebido! Confirme seu e-mail para continuar.');
            navigate("/verify-email", { state: { userId: result.userId } });
        } catch (error) {
            console.error('Erro ao registrar médico:', error);
            toast.warning(error instanceof Error ? error.message : 'Erro de conexão. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const fieldError = (key: string) =>
        errors[key] ? <span className="text-danger">{errors[key]}</span> : undefined;

    const header = stepTitles[currentStep];

    return (
        <>
            <ToastProvider />
            <RejectedVerificationDialog
                isOpen={isRejectedOpen}
                reason={rejectionReason}
                onReview={() => setIsRejectedOpen(false)}
            />

            <div className="flex flex-col md:flex-row w-full max-w-7xl h-fit md:h-[90vh] bg-surface rounded-2xl shadow-2xl overflow-hidden m-4 border border-border mx-auto">

                <div className="w-full md:w-1/2 flex justify-center items-center p-8 sm:p-12 lg:p-16 relative z-10 overflow-y-auto">
                    <div className="w-full max-w-md flex flex-col gap-5">

                        <div className="flex items-center justify-center gap-3 mb-1">
                            <Activity size={32} color="var(--primary)" strokeWidth={1.5} />
                            <span className="text-primary-text text-2xl font-bold tracking-tight">Medora</span>
                        </div>

                        <FormStepper currentStep={currentStep} totalSteps={TOTAL_STEPS} />

                        <div className="text-center">
                            <h2 className="text-primary-text text-2xl font-bold mb-1">{header.title}</h2>
                            <p className="text-text-secondary text-sm">{header.subtitle}</p>
                        </div>

                        <form onSubmit={handleFormSubmit} noValidate className="relative min-h-105 w-full">

                            {currentStep === 1 && (
                                <div className="flex flex-col gap-4 animate-appearance-in">
                                    <FieldWrapper label="E-mail" description={fieldError('email')}>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={formData.email}
                                            autoComplete="off"
                                            onChange={(e) => setField('email', e.target.value)}
                                            className={inputClass(!!errors.email)}
                                        />
                                    </FieldWrapper>

                                    <div>
                                        <PasswordInput
                                            id="password"
                                            label="Senha"
                                            value={formData.password}
                                            onChange={(e) => setField('password', e.target.value)}
                                            rules={passwordRules}
                                            hasError={!!errors.password}
                                        />
                                        {errors.password && (
                                            <div className="text-xs mt-1 text-danger">{errors.password}</div>
                                        )}
                                    </div>

                                    <FieldWrapper label="Confirmar senha" description={fieldError('confirmPassword')}>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            autoComplete="off"
                                            placeholder="Repita a senha"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                clearError('confirmPassword');
                                            }}
                                            className={inputClass(!!errors.confirmPassword)}
                                        />
                                    </FieldWrapper>

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full mt-1 font-semibold rounded-md"
                                        onPress={goNext}
                                    >
                                        Continuar
                                    </Button>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="flex flex-col gap-4 animate-appearance-in">
                                    <FieldWrapper label="Nome completo" description={fieldError('fullName')}>
                                        <Input
                                            id="fullName"
                                            placeholder="Como consta no seu documento"
                                            value={formData.fullName}
                                            onChange={(e) => setField('fullName', e.target.value)}
                                            autoComplete="off"
                                            className={inputClass(!!errors.fullName)}
                                        />
                                    </FieldWrapper>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <FieldWrapper label="Data de nascimento" description={fieldError('birthDate')}>
                                            <Input
                                                id="birthDate"
                                                type="date"
                                                max={todayISO()}
                                                value={formData.birthDate}
                                                onChange={(e) => setField('birthDate', e.target.value)}
                                                className={inputClass(!!errors.birthDate)}
                                            />
                                        </FieldWrapper>

                                        <FieldWrapper label="Telefone" description={fieldError('phone')}>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                inputMode="numeric"
                                                placeholder="(00) 00000-0000"
                                                maxLength={15}
                                                value={formData.phone}
                                                onChange={maskedChange('phone', maskPhone)}
                                                onPaste={maskedPaste('phone', maskPhone, normalizePhonePaste)}
                                                autoComplete="off"
                                                className={inputClass(!!errors.phone)}
                                            />
                                        </FieldWrapper>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <FieldWrapper label="Sexo" description={fieldError('sex')}>
                                            <select
                                                id="sex"
                                                aria-invalid={!!errors.sex}
                                                value={formData.sex || ''}
                                                onChange={(e) => setField('sex', Number(e.target.value))}
                                                className={selectClass(!!errors.sex)}
                                            >
                                                <option value="" disabled>Selecione</option>
                                                {sexOptions.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                        </FieldWrapper>

                                        <FieldWrapper label="Raça/Cor" description={fieldError('race')}>
                                            <select
                                                id="race"
                                                aria-invalid={!!errors.race}
                                                value={formData.race || ''}
                                                onChange={(e) => setField('race', Number(e.target.value))}
                                                className={selectClass(!!errors.race)}
                                            >
                                                <option value="" disabled>Selecione</option>
                                                {raceOptions.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                        </FieldWrapper>
                                    </div>

                                    <div className="flex gap-3 mt-1">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-1/3 font-medium rounded-md border-border text-text-secondary hover:text-text-primary"
                                            onPress={goBack}
                                        >
                                            Voltar
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="w-2/3 font-semibold rounded-md"
                                            onPress={goNext}
                                        >
                                            Continuar
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="flex flex-col gap-4 animate-appearance-in">
                                    <FieldWrapper label="Nacionalidade">
                                        <div role="radiogroup" aria-label="Nacionalidade" className="grid grid-cols-2 gap-2">
                                            {[
                                                { label: 'Brasileiro(a)', value: false },
                                                { label: 'Estrangeiro(a)', value: true },
                                            ].map((option) => {
                                                const selected = isForeigner === option.value;
                                                return (
                                                    <button
                                                        key={option.label}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={selected}
                                                        onClick={() => handleNationalityChange(option.value)}
                                                        className={`h-10 rounded-lg border text-sm font-medium transition-colors ${
                                                            selected
                                                                ? 'border-primary bg-primary-subtle text-primary'
                                                                : 'border-border text-text-secondary hover:text-text-primary'
                                                        }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </FieldWrapper>

                                    {!isForeigner && (
                                        <FieldWrapper label="CPF" description={fieldError('cpf')}>
                                            <Input
                                                id="cpf"
                                                inputMode="numeric"
                                                placeholder="000.000.000-00"
                                                maxLength={14}
                                                value={formData.cpf ?? ''}
                                                autoComplete="off"
                                                onChange={maskedChange('cpf', maskCpf)}
                                                onPaste={maskedPaste('cpf', maskCpf)}
                                                className={inputClass(!!errors.cpf)}
                                            />
                                        </FieldWrapper>
                                    )}

                                    {isForeigner && (
                                        <div className="flex flex-col gap-4 animate-appearance-in">
                                            <FieldWrapper
                                                label="Nacionalidade (código do país)"
                                                description={fieldError('nationality') ?? 'Código de 2 letras. Ex.: PT, AR, US'}
                                            >
                                                <Input
                                                    id="nationality"
                                                    placeholder="PT"
                                                    maxLength={2}
                                                    value={formData.nationality}
                                                    onChange={(e) => setField('nationality', e.target.value.replace(/[^a-z]/gi, '').toUpperCase())}
                                                    autoComplete="off"
                                                    className={inputClass(!!errors.nationality)}
                                                />
                                            </FieldWrapper>

                                            <FieldWrapper label="País de nascimento" description={fieldError('birthCountry')}>
                                                <Input
                                                    id="birthCountry"
                                                    placeholder="Ex.: Portugal"
                                                    value={formData.foreigner?.birthCountry ?? ''}
                                                    onChange={(e) => setForeignerField('birthCountry', e.target.value)}
                                                    className={inputClass(!!errors.birthCountry)}
                                                />
                                            </FieldWrapper>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <FieldWrapper label="Nº do passaporte" description={fieldError('passportNumber')}>
                                                    <Input
                                                        id="passportNumber"
                                                        placeholder="AB123456"
                                                        value={formData.foreigner?.passportNumber ?? ''}
                                                        onChange={(e) => setForeignerField('passportNumber', maskPassport(e.target.value))}
                                                        onPaste={(e) => {
                                                            e.preventDefault();
                                                            setForeignerField('passportNumber', maskPassport(e.clipboardData.getData('text')));
                                                        }}
                                                        className={inputClass(!!errors.passportNumber)}
                                                    />
                                                </FieldWrapper>

                                                <FieldWrapper label="País emissor" description={fieldError('passportIssuerCountry')}>
                                                    <Input
                                                        id="passportIssuerCountry"
                                                        placeholder="Ex.: Portugal"
                                                        value={formData.foreigner?.passportIssuerCountry ?? ''}
                                                        onChange={(e) => setForeignerField('passportIssuerCountry', e.target.value)}
                                                        className={inputClass(!!errors.passportIssuerCountry)}
                                                    />
                                                </FieldWrapper>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <FieldWrapper label="Data de emissão" description={fieldError('passportIssueDate')}>
                                                    <Input
                                                        id="passportIssueDate"
                                                        type="date"
                                                        max={todayISO()}
                                                        value={formData.foreigner?.passportIssueDate ?? ''}
                                                        onChange={(e) => setForeignerField('passportIssueDate', e.target.value)}
                                                        className={inputClass(!!errors.passportIssueDate)}
                                                    />
                                                </FieldWrapper>

                                                <FieldWrapper label="Validade" description={fieldError('passportExpirationDate')}>
                                                    <Input
                                                        id="passportExpirationDate"
                                                        type="date"
                                                        value={formData.foreigner?.passportExpirationDate ?? ''}
                                                        onChange={(e) => setForeignerField('passportExpirationDate', e.target.value)}
                                                        className={inputClass(!!errors.passportExpirationDate)}
                                                    />
                                                </FieldWrapper>
                                            </div>

                                            <FieldWrapper
                                                label="Data de naturalização (opcional)"
                                                description={fieldError('naturalizationDate')}
                                            >
                                                <Input
                                                    id="naturalizationDate"
                                                    type="date"
                                                    max={todayISO()}
                                                    value={formData.foreigner?.naturalizationDate ?? ''}
                                                    onChange={(e) => setForeignerField('naturalizationDate', e.target.value)}
                                                    className={inputClass(!!errors.naturalizationDate)}
                                                />
                                            </FieldWrapper>
                                        </div>
                                    )}

                                    <div className="flex gap-3 mt-1">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-1/3 font-medium rounded-md border-border text-text-secondary hover:text-text-primary"
                                            onPress={goBack}
                                        >
                                            Voltar
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="w-2/3 font-semibold rounded-md"
                                            onPress={goNext}
                                        >
                                            Continuar
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="flex flex-col gap-4 animate-appearance-in">
                                    <FieldWrapper
                                        label="UF e CRM"
                                        description={
                                            fieldError('crmState') ??
                                            fieldError('crm') ?? (
                                                <>Validamos seu CRM em segundo plano. Avisaremos por e-mail quando terminar.</>
                                            )
                                        }
                                    >
                                        <div className="flex gap-3 h-10">
                                            <div className="relative w-1/3 flex items-center border border-border rounded-lg transition-colors bg-surface focus-within:border-primary-hover">
                                                <select
                                                    id="crmState"
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
                                                inputMode="numeric"
                                                placeholder="Número do CRM"
                                                maxLength={8}
                                                className={inputClass(!!errors.crm)}
                                                value={formData.crm}
                                                autoComplete="off"
                                                onChange={maskedChange('crm', maskCrm)}
                                                onPaste={maskedPaste('crm', maskCrm)}
                                            />
                                        </div>
                                    </FieldWrapper>

                                    <div className="flex gap-3 mt-1">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-1/3 font-medium rounded-md border-border text-text-secondary hover:text-text-primary"
                                            onPress={goBack}
                                        >
                                            Voltar
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            type="submit"
                                            isDisabled={isSubmitting}
                                            className="w-2/3 font-semibold rounded-md"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader2 size={16} className="animate-spin" />
                                                    Enviando...
                                                </span>
                                            ) : (
                                                'Finalizar cadastro'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>

                        {!isSubmitting && (
                            <div className="flex items-center justify-center gap-2 pt-1">
                                <span className="text-sm text-text-muted">Já tem uma conta?</span>
                                <a
                                    href="/login/"
                                    className="text-sm font-medium text-primary hover:text-primary-hover underline underline-offset-2 transition-colors"
                                >
                                    Fazer login
                                </a>
                            </div>
                        )}

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
export interface RegisterErrorInfo {
    message: string;
    fieldErrors?: Record<string, string>;
    step?: number;
}

type Target = { field: string; step: number };
type Rule = { test: RegExp; field?: string; step?: number; text?: string };
type Collected = { property?: string; message: string };

const GENERIC_MESSAGE = 'Não foi possível concluir o cadastro agora. Tente novamente em instantes.';

const TECHNICAL = /exception|parameter '|\(parameter|object reference|nullreference|system\.|stack ?trace|npgsql|sql|value cannot be|index was|at medora|\bat\s+\w+\.\w+\(/i;

const INVALID_DATA = 'Alguns dados informados são inválidos. Revise o formulário e tente novamente.';
const SERVER_PROBLEM = 'Tivemos um problema no nosso servidor. Seus dados foram mantidos, tente novamente em instantes.';
const GENERIC_TITLES: Record<string, string> = {
    'erro de argumento': INVALID_DATA,
    'erro de validacao': INVALID_DATA,
    'um ou mais erros de validacao ocorreram': INVALID_DATA,
    'one or more validation errors occurred': INVALID_DATA,
    'erro interno do servidor': SERVER_PROBLEM,
    'conflito': 'Já existe um cadastro com esses dados. Tente fazer login.',
    'acesso negado': 'Você não tem permissão para realizar esta ação.',
    'nao encontrado': 'Serviço indisponível no momento. Tente novamente mais tarde.',
};
const genericTitleOf = (message: string): string | undefined =>
    GENERIC_TITLES[normalize(message).replace(/\.$/, '')];

const FIELD_BY_PROPERTY: Record<string, Target> = {
    email: { field: 'email', step: 1 },
    password: { field: 'password', step: 1 },
    fullname: { field: 'fullName', step: 2 },
    birthdate: { field: 'birthDate', step: 2 },
    phone: { field: 'phone', step: 2 },
    sex: { field: 'sex', step: 2 },
    cpf: { field: 'cpf', step: 3 },
    nationality: { field: 'nationality', step: 3 },
    foreigner: { field: 'nationality', step: 3 },
    birthcountry: { field: 'birthCountry', step: 3 },
    naturalizationdate: { field: 'naturalizationDate', step: 3 },
    passportnumber: { field: 'passportNumber', step: 3 },
    passportissuercountry: { field: 'passportIssuerCountry', step: 3 },
    passportissuedate: { field: 'passportIssueDate', step: 3 },
    passportexpirationdate: { field: 'passportExpirationDate', step: 3 },
    crm: { field: 'crm', step: 4 },
    crmstate: { field: 'crmState', step: 4 },
};

const RULES: Rule[] = [
    { test: /email.*ja esta sendo usado|e-?mail.*ja (esta|foi) cadastrado/, field: 'email', step: 1,
        text: 'Este e-mail já está cadastrado. Use outro e-mail ou faça login.' },
    { test: /cpf ja cadastrado/, field: 'cpf', step: 3,
        text: 'Este CPF já está cadastrado. Faça login na sua conta.' },
    { test: /crm.*ja esta cadastrado/, field: 'crm', step: 4,
        text: 'Este CRM já está cadastrado. Se a conta é sua, faça login.' },
    { test: /cpf invalido/, field: 'cpf', step: 3,
        text: 'CPF inválido. Confira os números digitados.' },
    { test: /cpf (nao pode ser vazio|e obrigatorio)/, field: 'cpf', step: 3,
        text: 'Informe seu CPF.' },
    { test: /dados (de estrangeiro|do passaporte)/, field: 'nationality', step: 3 },
    { test: /passaporte.*(vencido|anterior)/, field: 'passportExpirationDate', step: 3 },
    { test: /emissao do passaporte/, field: 'passportIssueDate', step: 3 },
    { test: /numero do passaporte/, field: 'passportNumber', step: 3 },
    { test: /pais emissor/, field: 'passportIssuerCountry', step: 3 },
    { test: /pais de nascimento/, field: 'birthCountry', step: 3 },
    { test: /nacionalidade/, field: 'nationality', step: 3 },
    { test: /estado do crm/, field: 'crmState', step: 4 },
    { test: /\bcrm\b/, field: 'crm', step: 4 },
    { test: /senha/, field: 'password', step: 1 },
    { test: /e-?mail/, field: 'email', step: 1 },
    { test: /telefone/, field: 'phone', step: 2 },
    { test: /18 anos/, field: 'birthDate', step: 2 },
    { test: /\bnome\b/, field: 'fullName', step: 2 },
];

const normalize = (value: string) =>
    value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const pickString = (source: Record<string, unknown>, keys: string[]): string | undefined => {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return undefined;
};

function collect(data: unknown): Collected[] {
    if (typeof data === 'string') return data.trim() ? [{ message: data.trim() }] : [];

    if (Array.isArray(data)) return data.flatMap(collect);

    if (!isRecord(data)) return [];

    const property = pickString(data, ['propertyName', 'PropertyName', 'field', 'Field', 'property']);
    const own = pickString(data, ['errorMessage', 'ErrorMessage', 'message', 'Message', 'detail', 'title', 'error']);

    const nested: Collected[] = [];
    const errors = data.errors ?? data.Errors ?? data.Erros;

    if (Array.isArray(errors)) {
        nested.push(...errors.flatMap(collect));
    } else if (isRecord(errors)) {
        for (const [key, value] of Object.entries(errors)) {
            const messages = Array.isArray(value) ? value : [value];
            for (const message of messages) {
                if (typeof message === 'string' && message.trim()) {
                    nested.push({ property: key, message: message.trim() });
                }
            }
        }
    }

    if (nested.length > 0) return nested;

    return own ? [{ property, message: own }] : [];
}

function targetFromProperty(property?: string): Target | undefined {
    if (!property) return undefined;
    const last = property.split('.').pop() ?? property;
    return FIELD_BY_PROPERTY[last.replace(/\[.*\]/, '').toLowerCase()];
}

function classify(item: Collected): { text: string; target?: Target } | null {
    if (TECHNICAL.test(item.message)) return null;

    if (genericTitleOf(item.message)) return null;

    const normalized = normalize(item.message);
    const rule = RULES.find((r) => r.test.test(normalized));
    const text = rule?.text ?? item.message;

    const fromProperty = targetFromProperty(item.property);
    if (fromProperty) return { text, target: fromProperty };
    if (rule?.field && rule.step) return { text, target: { field: rule.field, step: rule.step } };
    return { text };
}

function messageFromStatus(status: number | undefined, code: string | undefined, raw: string | undefined): string | null {
    const lower = (raw ?? '').toLowerCase();

    if (!status) {
        if (code === 'ECONNABORTED' || code === 'ETIMEDOUT' || /timeout|timed out/.test(lower)) {
            return 'O servidor demorou para responder. Seu cadastro pode ter sido recebido: verifique seu e-mail ou tente entrar antes de enviar novamente.';
        }
        if (code === 'ERR_NETWORK' || /network ?error|failed to fetch|networkerror|load failed/.test(lower)) {
            return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.';
        }
        return null;
    }

    if (status === 408 || status === 504) {
        return 'O servidor demorou para responder. Seu cadastro pode ter sido recebido: verifique seu e-mail ou tente entrar antes de enviar novamente.';
    }
    if (status === 409) return 'Já existe um cadastro com esses dados. Tente fazer login.';
    if (status === 429) return 'Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.';
    if (status === 401 || status === 403) return 'Você não tem permissão para realizar esta ação.';
    if (status === 404) return 'Serviço indisponível no momento. Tente novamente mais tarde.';
    if (status >= 500) return 'Tivemos um problema no nosso servidor. Seus dados foram mantidos, tente novamente em instantes.';
    return null;
}

export function parseRegisterError(error: unknown): RegisterErrorInfo {
    const root = isRecord(error) ? error : {};
    const response = isRecord(root.response) ? root.response : undefined;

    const status = [response?.status, root.status, root.statusCode].find(
        (v): v is number => typeof v === 'number',
    );
    const code = typeof root.code === 'string' ? root.code : undefined;
    const rawMessage = typeof root.message === 'string' ? root.message : undefined;
    const data = response?.data ?? root.data ?? root.body ?? root.details;

    // Corpo da API; se o cliente HTTP só repassou Error(message), usa a própria mensagem.
    const collected = collect(data);
    if (collected.length === 0 && rawMessage) collected.push({ message: rawMessage });

    const fieldErrors: Record<string, string> = {};
    let step: number | undefined;
    let firstText: string | undefined;

    for (const item of collected) {
        const result = classify(item);
        if (!result) continue;

        firstText ??= result.text;
        if (result.target && !(result.target.field in fieldErrors)) {
            fieldErrors[result.target.field] = result.text;
            step = step === undefined ? result.target.step : Math.min(step, result.target.step);
        }
    }

    if (Object.keys(fieldErrors).length > 0) {
        return { message: firstText ?? GENERIC_MESSAGE, fieldErrors, step };
    }

    const fromStatus = messageFromStatus(status, code, rawMessage);
    if (fromStatus) return { message: fromStatus };

    if (firstText && (status === undefined || (status >= 400 && status < 500))) {
        return { message: firstText };
    }

    const fromTitle = collected.map((c) => genericTitleOf(c.message)).find(Boolean);
    if (fromTitle) return { message: fromTitle };

    return { message: GENERIC_MESSAGE };
}
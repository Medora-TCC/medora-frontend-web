/**
 * Máscaras e validadores de formato.
 *
 * Convenção: o estado do formulário guarda o valor MASCARADO (o que o usuário vê);
 * na hora de enviar à API use `onlyDigits()` para obter o valor limpo.
 */

export const onlyDigits = (value: string): string => value.replace(/\D/g, '');

/** 000.000.000-00 */
export function maskCpf(value: string): string {
    const d = onlyDigits(value).slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** (00) 0000-0000 (fixo) ou (00) 00000-0000 (celular) — alterna conforme a quantidade de dígitos. */
export function maskPhone(value: string): string {
    const d = onlyDigits(value).slice(0, 11);
    if (d.length === 0) return '';
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** CEP: 00000-000 (disponível para quando houver campo de endereço). */
export function maskCep(value: string): string {
    const d = onlyDigits(value).slice(0, 8);
    return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
}

/** CRM: somente dígitos. */
export function maskCrm(value: string): string {
    return onlyDigits(value).slice(0, 8);
}

/** Passaporte: alfanumérico em maiúsculas. */
export function maskPassport(value: string): string {
    return value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 20);
}

/**
 * Normaliza texto COLADO de telefone: remove o código do país (+55) quando o
 * usuário cola algo como "+55 (41) 99999-9999". Só deve ser usado em onPaste —
 * durante a digitação, "55" é um DDD válido (RS).
 */
export function normalizePhonePaste(text: string): string {
    const d = onlyDigits(text);
    return d.length > 11 && d.startsWith('55') ? d.slice(2) : d;
}

export function isValidCpf(value: string): boolean {
    const d = onlyDigits(value);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

    const checkDigit = (length: number): number => {
        let sum = 0;
        for (let i = 0; i < length; i++) sum += Number(d[i]) * (length + 1 - i);
        const rest = (sum * 10) % 11;
        return rest === 10 ? 0 : rest;
    };

    return checkDigit(9) === Number(d[9]) && checkDigit(10) === Number(d[10]);
}

/** 10 dígitos (fixo) ou 11 (celular, começando em 9 após o DDD). DDD de 11 a 99. */
export function isValidPhone(value: string): boolean {
    const d = onlyDigits(value);
    if (!/^[1-9][1-9]/.test(d)) return false;
    if (d.length === 11) return d[2] === '9';
    return d.length === 10;
}
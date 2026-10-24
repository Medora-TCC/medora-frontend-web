import { Endpoints } from '../enums/endpoints';
import { MfaAction } from '../enums/mfaAction';
import { api } from './api';
import { toDomainError } from '../errors';

interface InitiateMfaOutput {
  useAuthenticationApp: boolean;
  /** E-mail para onde o código foi enviado, quando o usuário não usa app autenticador */
  sentTo: string | null;
}

/** Gera um segredo TOTP pendente (vale 10 min) e devolve a URI otpauth:// para o app */
async function configureAuthenticator(): Promise<string> {
  try {
    const res = await api.post<{ totpUri: string }>(Endpoints.CONFIGURE_AUTHENTICATOR);
    return res.data.totpUri;
  } catch (error) {
    throw toDomainError(error, 'Erro ao iniciar a configuração do aplicativo autenticador.');
  }
}

async function verifyAuthenticator(code: string): Promise<void> {
  try {
    await api.post(Endpoints.VERIFY_AUTHENTICATOR, { code });
  } catch (error) {
    throw toDomainError(error, 'Código inválido. Confira o código no aplicativo e tente de novo.');
  }
}

/** Envia o código por e-mail, ou não faz nada se o usuário já usa app autenticador */
async function initiateBackupCodes(): Promise<InitiateMfaOutput> {
  try {
    const res = await api.post<InitiateMfaOutput>(Endpoints.INIT_MFA, { Action: MfaAction.CREATE_BACKUP_CODES });
    return res.data;
  } catch (error) {
    throw toDomainError(error, 'Erro ao iniciar a geração dos códigos de backup.');
  }
}

/** Valida o código de 2FA e gera 10 códigos de backup novos */
async function createBackupCodes(code: string): Promise<string[]> {
  let mfaToken: string;
  try {
    const res = await api.post<{ mfaToken: string }>(Endpoints.VERIFY_MFA, {
      code,
      rememberDevice: false,
      action: MfaAction.CREATE_BACKUP_CODES,
    });
    mfaToken = res.data.mfaToken;
  } catch (error) {
    throw toDomainError(error, 'Código inválido.');
  }

  try {
    const res = await api.post<{ recoveryCodes: string[] }>(Endpoints.CREATE_BACKUP_CODES, { mfaToken });
    return res.data.recoveryCodes;
  } catch (error) {
    throw toDomainError(error, 'Erro ao gerar os códigos de backup.');
  }
}

const MfaService = {
  configureAuthenticator,
  verifyAuthenticator,
  initiateBackupCodes,
  createBackupCodes,
};

export default MfaService;
